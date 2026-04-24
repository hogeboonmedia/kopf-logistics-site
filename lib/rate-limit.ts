/**
 * Tiny in-memory rate limiter using LRU.
 *
 * For low-volume endpoints (a freight company's contact form, a blog's
 * comment endpoint) this is plenty — Vercel keeps function instances warm
 * for several minutes between requests, so the LRU absorbs bursts well.
 *
 * For high-volume swap to Vercel KV: same interface, swap the storage.
 */

import { LRUCache } from "lru-cache";

interface Bucket {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, Bucket>({ max: 5000 });

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Allow at most `max` requests per `windowMs` for a given key. Sliding bucket
 * — the window resets `windowMs` after the first request in the bucket.
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = cache.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    cache.set(key, fresh);
    return { allowed: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  cache.set(key, existing);
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}
