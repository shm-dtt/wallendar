import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
import net from "node:net";

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

export function getClientIp(req: NextRequest): string | null {
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
