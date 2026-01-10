import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper } from "@/lib/server-canvas";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { incrementCount } from "@/lib/redis";
import dns from "node:dns/promises";
import net from "node:net";

const DEFAULT_CONFIG = {
  weekStart: "sunday",
  headerFormat: "full",
  textColor: "#ffffff",
  fontFamily: "Product Sans",
  offsetX: 0,
  offsetY: 0,
  viewMode: "desktop",
  calendarScale: 1,
  textOverlay: {
    enabled: false,
    content: "",
    fontSize: 1,
    font: "Product Sans",
    useTypographyFont: true,
    position: "center",
  },
};

// Initialize Rate Limiter
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
  });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper to check if IP is private/reserved
function isPrivateIp(ip: string): boolean {
  // IPv6 checks
  if (net.isIPv6(ip)) {
    // ::1 (Loopback)
    if (ip === "::1") return true;
    // fc00::/7 (Unique Local)
    if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
    // fe80::/10 (Link Local)
    if (ip.toLowerCase().startsWith("fe80")) return true;
    // ::ffff:127.0.0.1 (IPv4-mapped loopback)
    if (ip.toLowerCase().startsWith("::ffff:127.")) return true;
    // ::ffff:10.0.0.0/8
    if (ip.toLowerCase().startsWith("::ffff:10.")) return true;
     // ::ffff:192.168.0.0/16
    if (ip.toLowerCase().startsWith("::ffff:192.168.")) return true;
    // ::ffff:172.16.0.0/12
    if (ip.match(/^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i)) return true;
    return false;
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    // 127.0.0.0/8 (Loopback)
    if (ip.startsWith("127.")) return true;
    // 10.0.0.0/8 (Private)
    if (ip.startsWith("10.")) return true;
    // 192.168.0.0/16 (Private)
    if (ip.startsWith("192.168.")) return true;
    // 172.16.0.0/12 (Private)
    if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;
    // 169.254.0.0/16 (Link Local)
    if (ip.startsWith("169.254.")) return true;
    // 0.0.0.0/8 (Current network)
    if (ip.startsWith("0.")) return true;
    return false;
  }
  
  return false;
}

async function isSafeUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    
    // DNS Resolution to prevent rebinding/private access
    try {
      // Resolve both IPv4 and IPv6
      const addresses = await dns.lookup(parsed.hostname, { all: true });
      
      for (const addr of addresses) {
        if (isPrivateIp(addr.address)) {
          console.warn(`Blocked potentially unsafe IP resolution: ${addr.address} for host ${parsed.hostname}`);
          return false;
        }
      }
    } catch (e) {
      // If hostname cannot be resolved, fail safe
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function getClientIp(req: NextRequest): string {
  // 1. Check x-forwarded-for
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    // The first IP is the original client
    if (ips[0] && net.isIP(ips[0])) {
      return ips[0];
    }
  }

  // 2. Check x-real-ip
  const realIp = req.headers.get("x-real-ip");
  if (realIp && net.isIP(realIp)) {
    return realIp;
  }

  // 3. Fallback (safe default for rate limiter key if absolutely nothing found)
  return "unknown"; 
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      const ip = getClientIp(req);
      
      // If we can't identify IP, we might want to block or use a shared bucket
      // Here we use "unknown" but ideally your deployment (Vercel/AWS) guarantees an IP header
      const limitKey = ip === "unknown" ? "global_unknown" : ip;

      const { success } = await ratelimit.limit(limitKey);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    const formData = await req.formData();
    const imageEntry = formData.get("image");
    const configStr = formData.get("config") as string;

    if (!imageEntry) {
      return NextResponse.json(
        { error: "Missing image (file or URL)" },
        { status: 400 }
      );
    }

    // 2. Prepare Configuration
    const now = new Date();
    const defaults = {
      ...DEFAULT_CONFIG,
      month: now.getMonth(),
      year: now.getFullYear(),
    };

    let userConfig = {};
    if (configStr) {
      try {
        userConfig = JSON.parse(configStr);
      } catch (e) {
        console.warn("Invalid config JSON, using defaults");
      }
    }

    const config = { ...defaults, ...userConfig };

    // 3. Prepare Image Buffer & Validate Size/Safety
    let imageBuffer: Buffer;

    if (imageEntry instanceof File) {
      // Validate File Size
      if (imageEntry.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image too large (max 5MB)" },
          { status: 400 }
        );
      }
      const arrayBuffer = await imageEntry.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (typeof imageEntry === "string") {
      // Validate URL Safety (async now)
      if (!(await isSafeUrl(imageEntry))) {
        return NextResponse.json(
          { error: "Invalid or unsafe URL provided" },
          { status: 400 }
        );
      }

      // Fetch with timeout and size check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const res = await fetch(imageEntry, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

        // Check Content-Length header if available
        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image too large (max 5MB)" },
            { status: 400 }
          );
        }

        const arrayBuffer = await res.arrayBuffer();
        
        // Validate Actual Buffer Size
        if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image too large (max 5MB)" },
            { status: 400 }
          );
        }

        imageBuffer = Buffer.from(arrayBuffer);
      } catch (e) {
        return NextResponse.json(
          { error: "Failed to load image from URL" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // 4. Generate Wallpaper
    const resultBuffer = await generateWallpaper(imageBuffer, config as any);

    // 5. Track Usage
    await incrementCount();

    // 6. Return Result
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallendar-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    // Differentiate known errors vs unexpected
    const message = error instanceof Error ? error.message : "Failed to generate wallpaper";
    const status = message.includes("Image dimensions") || message.includes("Image resolution") ? 400 : 500;
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
