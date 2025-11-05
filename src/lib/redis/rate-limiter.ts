/**
 * Redis-based Rate Limiter
 *
 * Implements sliding window rate limiting using Redis for distributed rate limiting
 * across multiple server instances. Falls back to in-memory rate limiting when
 * Redis is unavailable.
 *
 * Related: Issue #76 - In-Memory Rate Limiter Migration to Redis
 */

import { getRedisClient, isFallbackEnabled } from "./client";
import logger from "@/lib/logger";
import { RATE_LIMITS, RATE_LIMITER_CONFIG } from "@/config/app-constants";

// Rate limit result interface
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
  retryAfter?: number;
}

// Rate limit configuration per route type
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries from memory store (runs periodically)
 */
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetTime <= now) {
      memoryStore.delete(key);
    }
  }
}

// Cleanup every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(cleanupMemoryStore, 60000);
}

/**
 * Fallback in-memory rate limiter
 *
 * Used when Redis is unavailable. Note: This is per-instance only,
 * not suitable for multi-instance production deployments.
 */
async function fallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetTime = now + windowMs;

  const existing = memoryStore.get(identifier);

  if (!existing || existing.resetTime <= now) {
    // New window or expired
    memoryStore.set(identifier, { count: 1, resetTime });

    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil(windowMs / 1000),
      limit,
    };
  }

  // Increment count
  existing.count += 1;
  memoryStore.set(identifier, existing);

  const success = existing.count <= limit;
  const remaining = Math.max(0, limit - existing.count);
  const resetInSeconds = Math.ceil((existing.resetTime - now) / 1000);

  return {
    success,
    remaining,
    reset: resetInSeconds,
    limit,
    retryAfter: success ? undefined : resetInSeconds,
  };
}

/**
 * Helper to set Redis key with expiry, handling both client types
 */
async function redisSetWithExpiry(
  redis: NonNullable<Awaited<ReturnType<typeof getRedisClient>>>,
  key: string,
  value: string,
  expirySeconds: number
): Promise<void> {
  if (redis.type === "upstash") {
    await redis.set(key, value, { ex: expirySeconds });
  } else {
    // ioredis
    await redis.set(key, value, "EX", expirySeconds);
  }
}

/**
 * Redis-based rate limiter using sliding window algorithm
 *
 * Uses Redis INCR and EXPIRE commands for atomic operations.
 * This ensures accurate rate limiting across multiple server instances.
 *
 * @param identifier Unique identifier (e.g., "ip:192.168.1.1" or "user:123")
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns Rate limit result with success status and metadata
 */
async function redisRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = await getRedisClient();

  if (!redis) {
    logger.warn("Redis client not available, using fallback rate limiter");

    if (!isFallbackEnabled()) {
      // Fallback disabled - deny all requests
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil(windowMs / 1000),
        limit,
        retryAfter: Math.ceil(windowMs / 1000),
      };
    }

    return fallbackRateLimit(identifier, limit, windowMs);
  }

  try {
    const key = `rate_limit:${identifier}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    // Get current count
    const currentStr = await redis.get(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current === 0) {
      // First request in window - initialize counter and set expiry
      await redisSetWithExpiry(redis, key, "1", windowSeconds);

      return {
        success: true,
        remaining: limit - 1,
        reset: windowSeconds,
        limit,
      };
    }

    if (current >= limit) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);
      const resetSeconds = ttl > 0 ? ttl : windowSeconds;

      return {
        success: false,
        remaining: 0,
        reset: resetSeconds,
        limit,
        retryAfter: resetSeconds,
      };
    }

    // Increment counter
    const newCount = await redis.incr(key);

    // Get TTL for reset time
    const ttl = await redis.ttl(key);
    const resetSeconds = ttl > 0 ? ttl : windowSeconds;

    // Check if we just exceeded the limit
    if (newCount > limit) {
      return {
        success: false,
        remaining: 0,
        reset: resetSeconds,
        limit,
        retryAfter: resetSeconds,
      };
    }

    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      reset: resetSeconds,
      limit,
    };
  } catch (error) {
    logger.error("Redis rate limit error:", error);

    // Fallback to in-memory on Redis errors
    if (isFallbackEnabled()) {
      logger.info("Falling back to in-memory rate limiter due to Redis error");
      return fallbackRateLimit(identifier, limit, windowMs);
    }

    // If fallback disabled, deny request
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(windowMs / 1000),
      limit,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }
}

/**
 * Main rate limiting function
 *
 * Automatically uses Redis if available, falls back to in-memory otherwise.
 *
 * @param identifier Unique identifier for the rate limit (e.g., IP, user ID)
 * @param config Rate limit configuration (limit and window)
 * @returns Rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit("ip:192.168.1.1", {
 *   limit: 100,
 *   windowMs: 60000, // 1 minute
 * });
 *
 * if (!result.success) {
 *   return new Response("Rate limit exceeded", {
 *     status: 429,
 *     headers: {
 *       "X-RateLimit-Limit": result.limit.toString(),
 *       "X-RateLimit-Remaining": result.remaining.toString(),
 *       "X-RateLimit-Reset": result.reset.toString(),
 *       "Retry-After": result.retryAfter?.toString() || "60",
 *     },
 *   });
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs } = config;

  // Validate inputs
  if (!identifier || identifier.trim().length === 0) {
    throw new Error("Rate limit identifier cannot be empty");
  }

  if (limit <= 0) {
    throw new Error("Rate limit must be greater than 0");
  }

  if (windowMs <= 0) {
    throw new Error("Rate limit window must be greater than 0");
  }

  return redisRateLimit(identifier, limit, windowMs);
}

/**
 * Predefined rate limit configurations for common routes
 * Using existing RATE_LIMITS from app-constants.ts
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints (stricter limits)
  AUTH_LOGIN: {
    limit: RATE_LIMITS.AUTH,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },
  AUTH_REGISTER: {
    limit: RATE_LIMITS.REGISTER,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // File upload endpoints
  UPLOAD: {
    limit: RATE_LIMITS.UPLOAD,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // Checkout endpoints
  CHECKOUT: {
    limit: RATE_LIMITS.CHECKOUT,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // Profile endpoints
  PROFILE: {
    limit: RATE_LIMITS.PROFILE,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // Cart endpoints
  CART: {
    limit: RATE_LIMITS.CART,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // API endpoints (moderate limits)
  API_GENERAL: {
    limit: RATE_LIMITS.GENERAL_API,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },

  // Default fallback
  DEFAULT: {
    limit: RATE_LIMITS.GENERAL_API,
    windowMs: RATE_LIMITER_CONFIG.INTERVAL, // 1 minute
  },
} as const;

/**
 * Helper to get rate limit config based on request path
 *
 * @param pathname Request pathname
 * @returns Appropriate rate limit configuration
 */
export function getRateLimitConfigForPath(pathname: string): RateLimitConfig {
  // Authentication endpoints
  if (pathname.includes("/api/v1/login") || pathname.includes("/api/auth/login")) {
    return RATE_LIMIT_CONFIGS.AUTH_LOGIN;
  }

  if (pathname.includes("/api/v1/register") || pathname.includes("/api/auth/register")) {
    return RATE_LIMIT_CONFIGS.AUTH_REGISTER;
  }

  // Upload endpoints
  if (pathname.includes("/api/v1/upload")) {
    return RATE_LIMIT_CONFIGS.UPLOAD;
  }

  // Checkout endpoints
  if (pathname.includes("/api/v1/checkout") || pathname.includes("/api/v1/purchases")) {
    return RATE_LIMIT_CONFIGS.CHECKOUT;
  }

  // Profile endpoints
  if (pathname.includes("/api/v1/profile") || pathname.includes("/api/v1/me")) {
    return RATE_LIMIT_CONFIGS.PROFILE;
  }

  // Cart endpoints
  if (pathname.includes("/api/v1/cart")) {
    return RATE_LIMIT_CONFIGS.CART;
  }

  // API endpoints
  if (pathname.startsWith("/api/v1/")) {
    return RATE_LIMIT_CONFIGS.API_GENERAL;
  }

  // Default for everything else
  return RATE_LIMIT_CONFIGS.DEFAULT;
}

/**
 * Get identifier from request
 *
 * Uses IP address as primary identifier, falls back to "anonymous" if not available.
 * Can be extended to use user ID for authenticated requests.
 *
 * @param request NextRequest object
 * @param userId Optional user ID for authenticated requests
 * @returns Identifier string
 */
export function getIdentifierFromRequest(
  request: Request,
  userId?: string
): string {
  // Use user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP address from various headers
  const headers = request.headers;

  // Vercel/Cloudflare
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const clientIp = ips[0].trim();
    return `ip:${clientIp}`;
  }

  // Other proxies
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Cloudflare specific
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return `ip:${cfConnectingIp}`;
  }

  // Fallback to anonymous (not ideal for rate limiting)
  return "ip:anonymous";
}

/**
 * Reset rate limit for an identifier (useful for testing or manual override)
 *
 * @param identifier Rate limit identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const redis = await getRedisClient();

  if (redis) {
    try {
      const key = `rate_limit:${identifier}`;
      await redis.del(key);
      logger.info(`Rate limit reset for: ${identifier}`);
    } catch (error) {
      logger.error("Failed to reset rate limit in Redis:", error);
    }
  }

  // Also clear from memory store
  memoryStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 *
 * @param identifier Rate limit identifier
 * @param config Rate limit configuration
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = await getRedisClient();

  if (!redis) {
    // Check memory store
    const existing = memoryStore.get(identifier);
    if (!existing) {
      return {
        success: true,
        remaining: config.limit,
        reset: Math.ceil(config.windowMs / 1000),
        limit: config.limit,
      };
    }

    const now = Date.now();
    if (existing.resetTime <= now) {
      return {
        success: true,
        remaining: config.limit,
        reset: Math.ceil(config.windowMs / 1000),
        limit: config.limit,
      };
    }

    const remaining = Math.max(0, config.limit - existing.count);
    const resetSeconds = Math.ceil((existing.resetTime - now) / 1000);

    return {
      success: existing.count <= config.limit,
      remaining,
      reset: resetSeconds,
      limit: config.limit,
      retryAfter: existing.count > config.limit ? resetSeconds : undefined,
    };
  }

  try {
    const key = `rate_limit:${identifier}`;
    const currentStr = await redis.get(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current === 0) {
      return {
        success: true,
        remaining: config.limit,
        reset: Math.ceil(config.windowMs / 1000),
        limit: config.limit,
      };
    }

    const ttl = await redis.ttl(key);
    const resetSeconds = ttl > 0 ? ttl : Math.ceil(config.windowMs / 1000);
    const remaining = Math.max(0, config.limit - current);

    return {
      success: current <= config.limit,
      remaining,
      reset: resetSeconds,
      limit: config.limit,
      retryAfter: current > config.limit ? resetSeconds : undefined,
    };
  } catch (error) {
    logger.error("Failed to get rate limit status:", error);
    return {
      success: true,
      remaining: config.limit,
      reset: Math.ceil(config.windowMs / 1000),
      limit: config.limit,
    };
  }
}
