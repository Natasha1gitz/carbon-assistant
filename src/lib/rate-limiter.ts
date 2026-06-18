/**
 * In-memory sliding window rate limiter for Server Actions.
 *
 * Since this project does not strictly require Redis, this in-memory
 * implementation protects the API actions (like Gemini generation)
 * from abuse or DoS by limiting requests per IP/user session.
 */

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitInfo>();

const LIMIT = 10; // Max requests
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 *
 * @param identifier
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
