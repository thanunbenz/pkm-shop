/**
 * Redis Client Configuration
 *
 * Provides Redis client instances for Upstash (serverless) or traditional Redis.
 * Supports both HTTP-based (Upstash) and TCP-based (ioredis) connections.
 *
 * Related: Issue #76 - In-Memory Rate Limiter Migration to Redis
 */

import logger from "@/lib/logger";

// Type definitions for Redis clients
export type RedisClient = UpstashRedisClient | IoredisClient | null;

interface UpstashRedisClient {
  type: "upstash";
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, opts?: { ex?: number; px?: number }) => Promise<string>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  del: (key: string) => Promise<number>;
}

interface IoredisClient {
  type: "ioredis";
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, mode?: string, duration?: number) => Promise<"OK" | null>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  del: (key: string) => Promise<number>;
  quit: () => Promise<"OK">;
}

/**
 * Redis configuration from environment variables
 */
const REDIS_CONFIG = {
  // Upstash Redis (recommended for serverless)
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,

  // Traditional Redis
  redisUrl: process.env.REDIS_URL,

  // Feature flags
  enableRedis: process.env.ENABLE_REDIS_RATE_LIMIT !== "false", // Enabled by default
  fallbackToMemory: process.env.RATE_LIMIT_FALLBACK !== "false", // Fallback enabled by default
} as const;

/**
 * Singleton Redis client instance
 */
let redisClient: RedisClient = null;
let redisInitialized = false;
let redisAvailable = false;

/**
 * Create Upstash Redis client (HTTP-based, serverless-friendly)
 */
async function createUpstashClient(): Promise<UpstashRedisClient | null> {
  const { upstashUrl, upstashToken } = REDIS_CONFIG;

  if (!upstashUrl || !upstashToken) {
    logger.warn("Upstash Redis credentials not found in environment variables");
    return null;
  }

  try {
    // Create a lightweight HTTP-based client for Upstash
    const client: UpstashRedisClient = {
      type: "upstash",

      async get(key: string) {
        const response = await fetch(`${upstashUrl}/get/${key}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });

        if (!response.ok) {
          throw new Error(`Upstash GET failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },

      async set(key: string, value: string, opts = {}) {
        const url = new URL(`${upstashUrl}/set/${key}`);
        const body: string[] = [value];

        if (opts.ex) {
          body.push("EX", opts.ex.toString());
        } else if (opts.px) {
          body.push("PX", opts.px.toString());
        }

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${upstashToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Upstash SET failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },

      async incr(key: string) {
        const response = await fetch(`${upstashUrl}/incr/${key}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${upstashToken}` },
        });

        if (!response.ok) {
          throw new Error(`Upstash INCR failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },

      async expire(key: string, seconds: number) {
        const response = await fetch(`${upstashUrl}/expire/${key}/${seconds}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${upstashToken}` },
        });

        if (!response.ok) {
          throw new Error(`Upstash EXPIRE failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },

      async ttl(key: string) {
        const response = await fetch(`${upstashUrl}/ttl/${key}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });

        if (!response.ok) {
          throw new Error(`Upstash TTL failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },

      async del(key: string) {
        const response = await fetch(`${upstashUrl}/del/${key}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${upstashToken}` },
        });

        if (!response.ok) {
          throw new Error(`Upstash DEL failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      },
    };

    // Test connection
    await client.set("test:connection", "ok", { ex: 10 });
    const testValue = await client.get("test:connection");

    if (testValue !== "ok") {
      throw new Error("Upstash connection test failed");
    }

    logger.info("✅ Upstash Redis client initialized successfully");
    return client;
  } catch (error) {
    logger.error("Failed to initialize Upstash Redis client:", error);
    return null;
  }
}

/**
 * Create traditional Redis client (requires ioredis package)
 *
 * Note: Requires `npm install ioredis` to use this option
 */
async function createIoredisClient(): Promise<IoredisClient | null> {
  const { redisUrl } = REDIS_CONFIG;

  if (!redisUrl) {
    logger.warn("Traditional Redis URL not found in environment variables");
    return null;
  }

  try {
    // Dynamically import ioredis (optional dependency)
    // @ts-ignore - ioredis is an optional dependency
    const Redis = (await import("ioredis")).default;

    const ioredisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error("Redis connection failed after 3 retries");
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000); // Exponential backoff
      },
      connectTimeout: 10000,
      lazyConnect: true,
    });

    // Connect to Redis
    await ioredisInstance.connect();

    const client: IoredisClient = {
      type: "ioredis",

      async get(key: string) {
        return await ioredisInstance.get(key);
      },

      async set(key: string, value: string, mode?: string, duration?: number) {
        if (mode && duration) {
          return await ioredisInstance.set(key, value, mode, duration);
        }
        return await ioredisInstance.set(key, value);
      },

      async incr(key: string) {
        return await ioredisInstance.incr(key);
      },

      async expire(key: string, seconds: number) {
        return await ioredisInstance.expire(key, seconds);
      },

      async ttl(key: string) {
        return await ioredisInstance.ttl(key);
      },

      async del(key: string) {
        return await ioredisInstance.del(key);
      },

      async quit() {
        return await ioredisInstance.quit();
      },
    };

    // Test connection
    await client.set("test:connection", "ok", "EX", 10);
    const testValue = await client.get("test:connection");

    if (testValue !== "ok") {
      throw new Error("Redis connection test failed");
    }

    logger.info("✅ Traditional Redis (ioredis) client initialized successfully");
    return client;
  } catch (error) {
    if ((error as any).code === "MODULE_NOT_FOUND") {
      logger.warn(
        "ioredis package not installed. Run 'npm install ioredis' to use traditional Redis."
      );
    } else {
      logger.error("Failed to initialize ioredis client:", error);
    }
    return null;
  }
}

/**
 * Initialize Redis client
 *
 * Tries in order:
 * 1. Upstash Redis (HTTP-based, serverless-friendly)
 * 2. Traditional Redis (ioredis, requires npm install ioredis)
 * 3. Falls back to null if Redis is disabled or unavailable
 */
async function initializeRedis(): Promise<void> {
  if (redisInitialized) {
    return;
  }

  redisInitialized = true;

  if (!REDIS_CONFIG.enableRedis) {
    logger.info("Redis rate limiting is disabled (ENABLE_REDIS_RATE_LIMIT=false)");
    redisAvailable = false;
    return;
  }

  logger.info("Initializing Redis client for rate limiting...");

  // Try Upstash first (recommended for serverless)
  if (REDIS_CONFIG.upstashUrl && REDIS_CONFIG.upstashToken) {
    logger.info("Attempting to connect to Upstash Redis...");
    redisClient = await createUpstashClient();

    if (redisClient) {
      redisAvailable = true;
      logger.info("✅ Using Upstash Redis for rate limiting");
      return;
    }
  }

  // Try traditional Redis as fallback
  if (REDIS_CONFIG.redisUrl) {
    logger.info("Attempting to connect to traditional Redis...");
    redisClient = await createIoredisClient();

    if (redisClient) {
      redisAvailable = true;
      logger.info("✅ Using traditional Redis (ioredis) for rate limiting");
      return;
    }
  }

  // No Redis available
  redisAvailable = false;
  logger.warn(
    "⚠️  No Redis connection available. Rate limiting will fall back to in-memory (not suitable for production with multiple instances)"
  );

  if (REDIS_CONFIG.fallbackToMemory) {
    logger.info("✅ Fallback to in-memory rate limiting is enabled");
  } else {
    logger.error(
      "❌ Fallback to in-memory rate limiting is disabled. Rate limiting will not work!"
    );
  }
}

/**
 * Get Redis client instance
 *
 * Initializes Redis on first call (lazy initialization)
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (!redisInitialized) {
    await initializeRedis();
  }

  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable;
}

/**
 * Check if fallback to in-memory is enabled
 */
export function isFallbackEnabled(): boolean {
  return REDIS_CONFIG.fallbackToMemory;
}

/**
 * Get Redis configuration (for debugging)
 */
export function getRedisConfig() {
  return {
    hasUpstashUrl: !!REDIS_CONFIG.upstashUrl,
    hasUpstashToken: !!REDIS_CONFIG.upstashToken,
    hasRedisUrl: !!REDIS_CONFIG.redisUrl,
    enableRedis: REDIS_CONFIG.enableRedis,
    fallbackToMemory: REDIS_CONFIG.fallbackToMemory,
    isInitialized: redisInitialized,
    isAvailable: redisAvailable,
    clientType: redisClient?.type || null,
  };
}

/**
 * Close Redis connection (call on shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.type === "ioredis") {
    try {
      await redisClient.quit();
      logger.info("Redis connection closed");
    } catch (error) {
      logger.error("Error closing Redis connection:", error);
    }
  }

  redisClient = null;
  redisInitialized = false;
  redisAvailable = false;
}
