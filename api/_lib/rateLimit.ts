import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function rateLimit(opts: RateLimitOptions): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / opts.windowSeconds) * opts.windowSeconds;
  const redisKey = `ratelimit:${opts.key}:${windowStart}`;

  try {
    // One round trip: the key is per-window, so refreshing its TTL on every hit
    // is harmless and saves a second request on the first hit of each window.
    const [current] = await redis.pipeline().incr(redisKey).expire(redisKey, opts.windowSeconds).exec<[number, number]>();
    const allowed = current <= opts.limit;
    const remaining = Math.max(0, opts.limit - current);
    return { allowed, remaining, reset: windowStart + opts.windowSeconds };
  } catch (err) {
    console.error('Rate limit error:', err);
    // Fail open if Redis is unavailable
    return { allowed: true, remaining: opts.limit, reset: windowStart + opts.windowSeconds };
  }
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}
