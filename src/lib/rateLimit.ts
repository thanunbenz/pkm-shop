/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
}

// Rate limiters for different endpoint categories
// Auth endpoints (login, register) - Very strict
export const authRateLimiter = new RateLimiter(
  60 * 60 * 1000, // 1 hour window
  5 // 5 requests per hour (protect against brute force)
);

// Sensitive admin endpoints (user management, settings) - Strict
export const adminRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  30 // 30 requests per minute
);

// Write operations (POST, PUT, DELETE) - Moderate
export const writeRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  20 // 20 requests per minute
);

// Upload endpoints - Moderate (prevents abuse)
export const uploadRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  10 // 10 requests per minute
);

// Public read endpoints - Generous
export const publicRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  100 // 100 requests per minute
);

// Cart/Checkout endpoints - Moderate (prevent cart spam)
export const cartRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  30 // 30 requests per minute
);

// General API fallback - Moderate
export const apiRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  60 // 60 requests per minute
);

// Helper function to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}
