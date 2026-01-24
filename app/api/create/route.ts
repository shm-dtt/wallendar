import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper, ImageValidationError } from "@/lib/server-canvas";
import { incrementCount } from "@/lib/redis";
import { ratelimit, getClientIp } from "@/lib/rate-limit";
import { validateConfig, DEFAULT_CONFIG, MAX_FILE_SIZE } from "@/lib/api-validation";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";
import { fetchSafeImage } from "@/lib/fetch-safe";

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();
  
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
      // URL Handling with Secure Fetch (SSRF Protection + SNI support)
      let totalSize = 0; 

      try {
        const res = await fetchSafeImage(imageEntry);

        // Safely extract content-type, handling potential array values
        const rawContentType = res.headers["content-type"];
        const contentType = Array.isArray(rawContentType) ? rawContentType[0] : rawContentType;

        // Case-insensitive check for MIME type per RFC 2045
        if (!contentType || !contentType.toLowerCase().startsWith("image/")) {
          res.destroy(); // Fix leak
          logger.warn("Invalid upstream content type", { requestId, contentType });
          throw new Error("URL must point to a valid image file");
        }

        // Safely extract and parse content-length
        const rawContentLength = res.headers["content-length"];
        const contentLengthStr = Array.isArray(rawContentLength) ? rawContentLength[0] : rawContentLength;
        
        if (contentLengthStr) {
          const contentLength = parseInt(contentLengthStr, 10);
          if (!isNaN(contentLength) && contentLength > MAX_FILE_SIZE) {
            res.destroy(); // Fix leak
            logger.warn("Upstream image too large (header)", { requestId, contentLength });
            return NextResponse.json(
              { error: `Image too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
              { status: 400 }
            );
          }
        }
        
        // Read the stream
        const chunks: Buffer[] = [];

        await new Promise<void>((resolve, reject) => {
          let rejected = false;
          let resolved = false;

          res.on('data', (chunk: Buffer) => {
            if (resolved || rejected) return;
            
            totalSize += chunk.length;
            if (totalSize > MAX_FILE_SIZE) {
              rejected = true;
              res.destroy(); // Stop stream
              reject(new Error("Image too large"));
              return;
            }
            chunks.push(chunk);
          });
          
          res.on('end', () => {
            if (resolved || rejected) return;
            resolved = true;
            resolve();
          });

          res.on('error', (err) => {
            if (resolved || rejected) return;
            rejected = true;
            reject(err);
          });
          
          // Handle unexpected connection closure
          res.on('close', () => {
            if (!resolved && !rejected) {
              rejected = true;
              reject(new Error("Connection closed prematurely"));
            }
          });
        });

        imageBuffer = Buffer.concat(chunks);

      } catch (e: any) {
        // Handle explicit size error
        if (e.message === "Image too large" || totalSize > MAX_FILE_SIZE) {
           logger.warn("Upstream image too large (stream)", { requestId, totalSize, limit: MAX_FILE_SIZE });
           return NextResponse.json(
             { error: `Image too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
             { status: 400 }
           );
        }

        // Only rethrow if it has a status property (likely a proxied upstream error response object)
        if (typeof e === 'object' && e !== null && 'status' in e) {
             throw e; 
        }

        logger.error("Image URL fetch error", { requestId, error: e instanceof Error ? e.message : "Unknown error" });
        return NextResponse.json(
          { error: "Failed to load image from the provided URL. Please ensure the URL is valid and accessible." },
          { status: 400 }
        );
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
    return new NextResponse(new Uint8Array(resultBuffer), {
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
