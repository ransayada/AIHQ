import type { MiddlewareHandler } from "hono";
import { getRedis } from "../lib/redis";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyFn?: (c: Parameters<MiddlewareHandler>[0]) => string;
}

/**
 * Sliding window rate limiter backed by Redis.
 */
export function rateLimit(opts: RateLimitOptions): MiddlewareHandler {
  return async (c, next) => {
    const userId = c.get("dbUserId") ?? c.req.header("x-forwarded-for") ?? "anonymous";
    const key = opts.keyFn ? opts.keyFn(c) : `rl:${c.req.path}:${userId}`;

    try {
      const redis = getRedis();
      const now = Date.now();
      const windowStart = now - opts.windowSeconds * 1000;

      // Sliding window using sorted set
      const pipe = redis.pipeline();
      pipe.zremrangebyscore(key, 0, windowStart);
      pipe.zadd(key, now, `${now}-${Math.random()}`);
      pipe.zcard(key);
      pipe.expire(key, opts.windowSeconds);

      const results = await pipe.exec();
      const count = (results?.[2]?.[1] as number) ?? 0;

      c.header("X-RateLimit-Limit", String(opts.maxRequests));
      c.header("X-RateLimit-Remaining", String(Math.max(0, opts.maxRequests - count)));

      if (count > opts.maxRequests) {
        return c.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } },
          429
        );
      }
    } catch (_err) {
      // If Redis is unavailable, fail open (don't block requests)
      console.error("Rate limit Redis error:", _err);
    }

    await next();
  };
}
