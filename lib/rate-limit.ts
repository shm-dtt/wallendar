import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const TRUST_PROXY = process.env.TRUST_PROXY === "true";

// Initialize Rate Limiter
export let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
  });
}

/**
 * Extracts client IP address from request.
 * 
 * SECURITY: Set TRUST_PROXY=true environment variable ONLY when deployed
 * behind a properly configured reverse proxy (Vercel, CloudFlare, nginx)
 * that strips/overrides x-forwarded-for and x-real-ip headers.
 * 
 * Without trusted proxy configuration, these headers can be spoofed to
 * bypass rate limiting.
 * 
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIp(request: NextRequest): string {
  if (!TRUST_PROXY) {
    // When not behind trusted proxy, use direct connection IP only
    return request.ip || "127.0.0.1";
  }
  
  // Only trust headers when explicitly configured
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || request.ip || "127.0.0.1";
}
