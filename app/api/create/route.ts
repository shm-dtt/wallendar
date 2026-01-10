import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper, WallpaperConfig } from "@/lib/server-canvas";
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

// Returns the resolved safe IP if valid, otherwise throws
async function resolveSafeIp(hostname: string): Promise<string> {
  // If it's already an IP, check directly
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error(`Forbidden IP address: ${hostname}`);
    }
    return hostname;
  }

  try {
    const result = await dns.lookup(hostname, { verbatim: true });
    
    if (isPrivateIp(result.address)) {
      throw new Error(`Resolved to private IP: ${result.address}`);
    }

    return result.address;
  } catch (e) {
    throw new Error(`DNS resolution failed or forbidden: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

function getClientIp(req: NextRequest): string | null {
  // 1. Check x-forwarded-for
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0] && net.isIP(ips[0])) {
      return ips[0];
    }
  }

  // 2. Check x-real-ip
  const realIp = req.headers.get("x-real-ip");
  if (realIp && net.isIP(realIp)) {
    return realIp;
  }

  return null;
}

function validateConfig(config: any): config is WallpaperConfig {
  if (typeof config !== "object" || config === null) return false;

  if (typeof config.month !== "number" || config.month < 0 || config.month > 11) return false;
  if (typeof config.year !== "number" || config.year < 1000 || config.year > 9999) return false;
  if (!["sunday", "monday"].includes(config.weekStart)) return false;
  
  // HeaderFormat check (simplified for now, ideally check strict enum values)
  if (typeof config.headerFormat !== "string") return false;
  
  if (typeof config.textColor !== "string") return false;
  if (typeof config.fontFamily !== "string") return false;
  if (typeof config.offsetX !== "number") return false;
  if (typeof config.offsetY !== "number") return false;
  if (!["desktop", "mobile"].includes(config.viewMode)) return false;
  if (typeof config.calendarScale !== "number" || config.calendarScale <= 0) return false;

  if (config.textOverlay) {
    if (typeof config.textOverlay !== "object") return false;
    if (typeof config.textOverlay.enabled !== "boolean") return false;
    if (typeof config.textOverlay.content !== "string") return false;
    if (typeof config.textOverlay.fontSize !== "number") return false;
    if (typeof config.textOverlay.font !== "string") return false;
    if (typeof config.textOverlay.useTypographyFont !== "boolean") return false;
    if (typeof config.textOverlay.position !== "string") return false;
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      const ip = getClientIp(req);
      
      if (!ip) {
        return NextResponse.json(
          { error: "Unable to identify client IP for rate limiting." },
          { status: 400 }
        );
      }

      const { success } = await ratelimit.limit(ip);
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
        return NextResponse.json(
          { error: "Invalid config JSON" },
          { status: 400 }
        );
      }
    }

    const mergedConfig = { ...defaults, ...userConfig };

    // Validate Config Type
    if (!validateConfig(mergedConfig)) {
      return NextResponse.json(
        { error: "Invalid configuration parameters" },
        { status: 400 }
      );
    }

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
      // URL Handling with TOCTOU protection
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const parsedUrl = new URL(imageEntry);
        
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
           return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
        }

        // 1. Resolve safe IP
        const safeIp = await resolveSafeIp(parsedUrl.hostname);

        // 2. Construct new URL using IP (mitigate DNS Rebinding TOCTOU)
        const targetUrl = new URL(imageEntry);
        targetUrl.hostname = safeIp;

        // 3. Fetch using IP, but with original Host header
        const res = await fetch(targetUrl.toString(), {
          signal: controller.signal,
          headers: {
            "Host": parsedUrl.hostname
          }
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

        // Check Content-Length header
        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image too large (max 5MB)" },
            { status: 400 }
          );
        }

        // Streaming download with byte counting
        if (!res.body) throw new Error("No response body");
        
        const chunks: Uint8Array[] = [];
        let totalSize = 0;
        const reader = res.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            if (value) {
              totalSize += value.length;
              if (totalSize > MAX_FILE_SIZE) {
                await reader.cancel();
                return NextResponse.json(
                  { error: "Image too large (max 5MB)" },
                  { status: 400 }
                );
              }
              chunks.push(value);
            }
          }
        } catch (streamError) {
          throw streamError;
        }

        imageBuffer = Buffer.concat(chunks);

      } catch (e) {
        return NextResponse.json(
          { error: `Failed to load image from URL: ${e instanceof Error ? e.message : 'Unknown'}` },
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
    const resultBuffer = await generateWallpaper(imageBuffer, mergedConfig);

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
    const message = error instanceof Error ? error.message : "Failed to generate wallpaper";
    const status = message.includes("Image dimensions") || message.includes("Image resolution") ? 400 : 500;
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
