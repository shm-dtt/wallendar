import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper, ImageValidationError } from "@/lib/server-canvas";
import { incrementCount } from "@/lib/redis";
import { ratelimit, getClientIp } from "@/lib/rate-limit";
import { resolveSafeIp } from "@/lib/ip-utils";
import { validateConfig, DEFAULT_CONFIG, MAX_FILE_SIZE } from "@/lib/api-validation";
import https from "node:https";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      // Securely retrieve client IP based on TRUST_PROXY configuration
      const ip = getClientIp(req);
      
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
    const configEntry = formData.get("config");

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
    
    // Explicitly check config entry existence and type
    if (configEntry !== null) {
      if (typeof configEntry !== "string") {
        return NextResponse.json(
          { error: "Config must be a JSON string" },
          { status: 400 }
        );
      }
      
      try {
        userConfig = JSON.parse(configEntry);
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

        // 1. Resolve safe IP to prevent SSRF
        const safeIp = await resolveSafeIp(parsedUrl.hostname);
        
        if (!safeIp) {
           return NextResponse.json(
             { error: "Invalid or inaccessible host" }, 
             { status: 400 }
           );
        }

        // 2. Construct new URL using IP (mitigate DNS Rebinding TOCTOU)
        const targetUrl = new URL(imageEntry);
        targetUrl.hostname = safeIp;

        // 3. Fetch using IP, but with original Host header for virtual hosting support
        const res = await fetch(targetUrl.toString(), {
          signal: controller.signal,
          headers: {
            "Host": parsedUrl.hostname
          }
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          console.error(`Upstream image fetch failed: ${res.status} ${res.statusText}`);
          throw new Error("Failed to fetch image from remote server");
        }

        // Validate Content-Type to ensure it is an image
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
          throw new Error("URL must point to a valid image file");
        }

        // Check Content-Length header for early rejection
        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image too large (max 5MB)" },
            { status: 400 }
          );
        }

        // Streaming download with byte counting to prevent memory exhaustion
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
        // Log detailed error server-side but return generic error to client
        console.error("Image URL fetch error:", e);
        
        // If we already sent a response (e.g. invalid host), don't overwrite it
        // This check is implicit because NextResponse.json returns from the function, 
        // but if e is caught from the main block, we need to return a generic error.
        
        // If the error is not a NextResponse, wrap it
        if (e instanceof Response || (typeof e === 'object' && e !== null && 'status' in e)) {
             // It's a next response we returned earlier (unlikely in this structure but good safety)
             throw e; 
        }

        return NextResponse.json(
          { error: "Failed to load image from the provided URL. Please ensure the URL is valid and accessible." },
          { status: 400 }
        );
      } finally {
        clearTimeout(timeoutId);
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
    // Cast resultBuffer to BodyInit to satisfy TypeScript strictness
    // Node.js Buffers are compatible at runtime
    return new NextResponse(resultBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallendar-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    
    let status = 500;
    let message = "Failed to generate wallpaper";
    
    if (error instanceof ImageValidationError) {
      status = 400;
      message = error.message;
    } else if (error instanceof Error) {
      // Don't expose internal error details in production
      message = process.env.NODE_ENV === 'production' 
        ? "Failed to generate wallpaper" 
        : error.message;
    }
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
