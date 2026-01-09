import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper } from "@/lib/server-canvas";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    
    const hostname = parsed.hostname;
    // Block local/private addresses
    if (hostname === "localhost" || hostname === "127.0.0.1") return false;
    if (hostname.startsWith("192.168.")) return false;
    if (hostname.startsWith("10.")) return false;
    // 172.16.0.0 - 172.31.255.255
    if (hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return false; 
    if (hostname.endsWith(".local")) return false; 

    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
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
      // Validate URL Safety
      if (!isSafeUrl(imageEntry)) {
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

    // 5. Return Result
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallendar-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to generate wallpaper" },
      { status: 500 }
    );
  }
}
