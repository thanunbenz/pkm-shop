/**
 * CORS Configuration
 *
 * Centralized configuration for Cross-Origin Resource Sharing (CORS).
 * Defines which origins are allowed to access the API and what methods/headers are permitted.
 *
 * Related: Issue #79 - Missing CORS Configuration
 */

/**
 * CORS Configuration Constants
 */
export const CORS_CONFIG = {
  /**
   * Maximum age (in seconds) for preflight request cache
   * 86400 seconds = 24 hours
   */
  MAX_AGE: "86400",

  /**
   * Allowed HTTP methods for CORS requests
   */
  ALLOWED_METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  /**
   * Allowed request headers for CORS requests
   */
  ALLOWED_HEADERS: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-API-Key",
  ],

  /**
   * Exposed response headers that browser can access
   */
  EXPOSED_HEADERS: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "X-API-Version",
    "X-Request-ID",
  ],

  /**
   * Whether to allow credentials (cookies, authorization headers)
   */
  ALLOW_CREDENTIALS: true,
} as const;

/**
 * Get allowed origins based on environment
 *
 * @returns Array of allowed origin URLs
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Production domains (from environment variable)
  if (process.env.ALLOWED_ORIGINS) {
    const prodOrigins = process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
    origins.push(...prodOrigins);
  }

  // Development origins
  if (process.env.NODE_ENV === "development") {
    origins.push(
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    );
  }

  // Remove duplicates
  return [...new Set(origins)];
}

/**
 * Check if an origin is allowed
 *
 * @param origin - Origin header value from request
 * @returns True if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();

  // If no origins configured and in development, allow all
  if (allowedOrigins.length === 0 && process.env.NODE_ENV === "development") {
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a given origin
 *
 * @param origin - Origin header value from request
 * @returns Object with CORS headers
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === "development" && !getAllowedOrigins().length) {
    // In development with no configured origins, allow all
    headers["Access-Control-Allow-Origin"] = origin || "*";
  }

  // Only add other headers if origin is set
  if (headers["Access-Control-Allow-Origin"]) {
    headers["Access-Control-Allow-Methods"] = CORS_CONFIG.ALLOWED_METHODS.join(", ");
    headers["Access-Control-Allow-Headers"] = CORS_CONFIG.ALLOWED_HEADERS.join(", ");
    headers["Access-Control-Expose-Headers"] = CORS_CONFIG.EXPOSED_HEADERS.join(", ");
    headers["Access-Control-Max-Age"] = CORS_CONFIG.MAX_AGE;

    if (CORS_CONFIG.ALLOW_CREDENTIALS) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  }

  return headers;
}

/**
 * Get CORS headers for preflight OPTIONS request
 *
 * @param origin - Origin header value from request
 * @returns Object with CORS headers for preflight
 */
export function getPreflightCorsHeaders(origin: string | null): Record<string, string> {
  return getCorsHeaders(origin);
}

/**
 * CORS Policy Types
 */
export type CorsPolicy = "api-only" | "public" | "strict" | "development";

/**
 * Get CORS configuration for different policies
 *
 * @param policy - CORS policy type
 * @returns CORS configuration
 */
export function getCorsPolicy(policy: CorsPolicy): {
  allowedOrigins: string[];
  allowCredentials: boolean;
} {
  switch (policy) {
    case "api-only":
      // Only allow configured origins
      return {
        allowedOrigins: getAllowedOrigins(),
        allowCredentials: true,
      };

    case "public":
      // Allow all origins (for public APIs)
      return {
        allowedOrigins: ["*"],
        allowCredentials: false,
      };

    case "strict":
      // Only production domains
      return {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
        allowCredentials: true,
      };

    case "development":
      // Allow localhost + configured origins
      return {
        allowedOrigins: getAllowedOrigins(),
        allowCredentials: true,
      };

    default:
      return {
        allowedOrigins: getAllowedOrigins(),
        allowCredentials: true,
      };
  }
}

/**
 * Validate CORS configuration on startup
 *
 * @throws Error if CORS configuration is invalid
 */
export function validateCorsConfig(): void {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn(
        "⚠️  ALLOWED_ORIGINS not set in production. API will not be accessible from external origins."
      );
    } else {
      const origins = getAllowedOrigins();
      console.log(`✅ CORS configured for ${origins.length} origin(s):`, origins);
    }
  } else {
    console.log("✅ CORS enabled for development (localhost origins)");
  }
}
