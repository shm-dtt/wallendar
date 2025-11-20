import { Redis } from "@upstash/redis";
import { unstable_cache } from "next/cache";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  // Only initialize in production with valid credentials to avoid runtime errors in dev/
  // client bundles and to prevent leaking tokens.
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Upstash Redis env vars are missing; skipping Redis operations."
    );
    return null;
  }

  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

export async function incrementCount() {
  // Only increment in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV] Generate tracked (not incrementing in dev)");
    return;
  }

  try {
    const client = getRedis();
    if (!client) return;
    await client.incr("wallpapers");
  } catch (error) {
    console.error("Failed to increment count:", error);
    // Don't throw - don't break user experience if Redis fails
  }
}

export async function getCount() {
  try {
    const client = getRedis();
    if (!client) return 0;
    const count = await client.get<number>("wallpapers");
    return count ?? 0;
  } catch (error) {
    console.error("Failed to get count:", error);
    return 0;
  }
}

// Cache the download count on the server for 4 hours to avoid hitting Redis on every request and to keep the landing page fast. The count may be stale within the revalidate window, which is acceptable for this use case.
export const getCachedCount = unstable_cache(
  async () => {
    return await getCount();
  },
  ["wallendar:count"],
  { revalidate: 60 * 60 * 4 }
);
