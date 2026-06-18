/**
 * In-memory sliding window rate limiter for Server Actions.
 *
 * Since this project does not strictly require Redis, this in-memory
 * implementation protects the API actions (like Gemini generation)
 * from abuse or DoS by limiting requests per IP/user session.
 */

/** Tracks the request count and window reset time for a single identifier. */
interface RateLimitInfo {
  count: number;
  resetAt: number;
}

/** In-memory store mapping identifiers to their rate limit state. */
const rateLimitStore = new Map<string, RateLimitInfo>();

/** Maximum number of requests allowed per window. */
const LIMIT = 10;

/** Duration of the sliding window in milliseconds (1 minute). */
const WINDOW_MS = 60 * 1000;

/**
 * Check whether the given identifier has exceeded the rate limit.
 * Increments the request count and returns the current limit state.
 * @param identifier - A unique key such as an IP address or user ID.
 */
export function checkRateLimit(identifier: string): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const info = rateLimitStore.get(identifier) || { count: 0, resetAt: now + WINDOW_MS };

  // Window expired, reset
  if (now > info.resetAt) {
    info.count = 0;
    info.resetAt = now + WINDOW_MS;
  }

  if (info.count >= LIMIT) {
    return {
      success: false,
      limit: LIMIT,
      remaining: 0,
      reset: info.resetAt,
    };
  }

  info.count += 1;
  rateLimitStore.set(identifier, info);

  return {
    success: true,
    limit: LIMIT,
    remaining: LIMIT - info.count,
    reset: info.resetAt,
  };
}
