import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper, ImageValidationError } from "@/lib/server-canvas";
import { incrementCount } from "@/lib/redis";
import { ratelimit, getClientIp } from "@/lib/rate-limit";
import { resolveSafeIp } from "@/lib/ip-utils";
import { validateConfig, DEFAULT_CONFIG, MAX_FILE_SIZE } from "@/lib/api-validation";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();
  
  // Basic request logging (no sensitive data)
  logger.info("Wallpaper generation request started", { 
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers.get("user-agent")
  });

  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      const ip = getClientIp(req);
      const { success } = await ratelimit.limit(ip);
      
      if (!success) {
        logger.warn("Rate limit exceeded", { requestId, ip });
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
      logger.warn("Missing image in request", { requestId });
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
    
    if (configEntry !== null) {
      if (typeof configEntry !== "string") {
        logger.warn("Invalid config format (not string)", { requestId });
        return NextResponse.json(
          { error: "Config must be a JSON string" },
          { status: 400 }
        );
      }
      
      try {
        userConfig = JSON.parse(configEntry);
      } catch (e) {
        logger.warn("Invalid config JSON", { requestId });
        return NextResponse.json(
          { error: "Invalid config JSON" },
          { status: 400 }
        );
      }
    }

    const mergedConfig = { ...defaults, ...userConfig };

    if (!validateConfig(mergedConfig)) {
      logger.warn("Invalid configuration parameters", { requestId, config: mergedConfig });
      return NextResponse.json(
        { error: "Invalid configuration parameters" },
        { status: 400 }
      );
    }

    // 3. Prepare Image Buffer & Validate Size/Safety
    let imageBuffer: Buffer;

    if (imageEntry instanceof File) {
      if (imageEntry.size > MAX_FILE_SIZE) {
        logger.warn("Image file too large", { requestId, size: imageEntry.size, limit: MAX_FILE_SIZE });
        return NextResponse.json(
          { error: `Image too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
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
           logger.warn("Invalid image URL protocol", { requestId, protocol: parsedUrl.protocol });
           return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
        }

        const safeIp = await resolveSafeIp(parsedUrl.hostname);
        
        if (!safeIp) {
           logger.warn("Invalid or inaccessible host", { requestId, hostname: parsedUrl.hostname });
           return NextResponse.json(
             { error: "Invalid or inaccessible host" }, 
             { status: 400 }
           );
        }

        const targetUrl = new URL(imageEntry);
        targetUrl.hostname = safeIp;

        const res = await fetch(targetUrl.toString(), {
          signal: controller.signal,
          headers: {
            "Host": parsedUrl.hostname
          }
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          logger.warn("Upstream image fetch failed", { requestId, status: res.status, url: imageEntry });
          throw new Error("Failed to fetch image from remote server");
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
          logger.warn("Invalid upstream content type", { requestId, contentType });
          throw new Error("URL must point to a valid image file");
        }

        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          logger.warn("Upstream image too large (header)", { requestId, contentLength });
          return NextResponse.json(
            { error: `Image too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
            { status: 400 }
          );
        }

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
                logger.warn("Upstream image too large (stream)", { requestId, totalSize });
                return NextResponse.json(
                  { error: `Image too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
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
        if (e instanceof Response || (typeof e === 'object' && e !== null && 'status' in e)) {
             throw e; 
        }

        logger.error("Image URL fetch error", { requestId, error: e instanceof Error ? e.message : "Unknown error" });
        return NextResponse.json(
          { error: "Failed to load image from the provided URL. Please ensure the URL is valid and accessible." },
          { status: 400 }
        );
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      logger.warn("Invalid image format", { requestId });
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // 4. Generate Wallpaper
    const resultBuffer = await generateWallpaper(imageBuffer, mergedConfig);

    // 5. Track Usage
    await incrementCount();

    const duration = Date.now() - startTime;
    logger.info("Wallpaper generated successfully", { requestId, durationMs: duration, size: resultBuffer.length });

    // 6. Return Result
    return new NextResponse(resultBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallendar-${Date.now()}.png"`,
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    let status = 500;
    let message = "Failed to generate wallpaper";
    
    if (error instanceof ImageValidationError) {
      status = 400;
      message = error.message;
      logger.warn("Image validation error", { requestId, error: message, durationMs: duration });
    } else if (error instanceof Error) {
      // Log full stack trace for internal errors
      logger.error("Internal server error", { requestId, error: error.message, stack: error.stack, durationMs: duration });
      
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
