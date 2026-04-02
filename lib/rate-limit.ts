/**
 * Simple in-memory rate limiter.
 *
 * Suitable for single-instance deployments (e.g. SQLite apps). For
 * multi-instance deployments, replace this with a Redis-backed solution.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

/**
 * Clear all rate-limit counters. Call this in test teardown to prevent
 * in-process state from leaking between test cases.
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Check whether `key` has exceeded `limit` requests within `windowMs`.
 *
 * Returns `true` if the request is allowed, `false` if it should be blocked.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
