/**
 * Application Constants
 *
 * Centralized configuration for magic numbers used throughout the application.
 * This makes the codebase more maintainable and self-documenting.
 *
 * Related: Issue #72 - Extract magic numbers to constants
 */

// ============================================================
// RATE LIMITING
// ============================================================

/**
 * Rate limit configuration for different API endpoints
 * All limits are per minute
 */
export const RATE_LIMITS = {
  /** Authentication endpoints (login, register) */
  AUTH: 5,

  /** Registration endpoint (stricter limit) */
  REGISTER: 3,

  /** Upload endpoints */
  UPLOAD: 10,

  /** Checkout and purchase operations */
  CHECKOUT: 20,

  /** General API endpoints */
  GENERAL_API: 30,

  /** User profile operations */
  PROFILE: 20,

  /** Cart operations */
  CART: 30,
} as const;

/**
 * Rate limiter configuration
 */
export const RATE_LIMITER_CONFIG = {
  /** Time window in milliseconds (1 minute) */
  INTERVAL: 60 * 1000,

  /** Maximum unique users per interval */
  UNIQUE_TOKEN_PER_INTERVAL: 500,

  /** Retry-After header value in seconds */
  RETRY_AFTER: '60',
} as const;

// ============================================================
// FILE UPLOAD
// ============================================================

/**
 * File upload limits and validation
 */
export const FILE_LIMITS = {
  /** Maximum file size: 5MB in bytes */
  MAX_SIZE: 5 * 1024 * 1024,

  /** Maximum file size in MB (for display) */
  MAX_SIZE_MB: 5,

  /** Allowed MIME types for uploads */
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],

  /** Allowed file extensions */
  ALLOWED_EXTENSIONS: [
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
  ],
} as const;

// ============================================================
// PAGINATION
// ============================================================

/**
 * Pagination defaults for list endpoints
 */
export const PAGINATION = {
  /** Default number of items per page */
  DEFAULT_PAGE_SIZE: 10,

  /** Maximum allowed page size */
  MAX_PAGE_SIZE: 100,

  /** Minimum page number */
  MIN_PAGE: 1,

  /** Common page size options for UI */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  /** Audit log page size */
  AUDIT_LOG_PAGE_SIZE: 20,

  /** Product recommendation limit */
  RECOMMEND_LIMIT: 4,
} as const;

// ============================================================
// TIMEOUTS
// ============================================================

/**
 * Timeout configuration in milliseconds
 */
export const TIMEOUTS = {
  /** General API request timeout: 2 minutes */
  REQUEST: 120000,

  /** Database query timeout: 30 seconds */
  DATABASE: 30000,

  /** Email sending timeout: 10 seconds */
  EMAIL: 10000,

  /** Session idle timeout: 7 days */
  SESSION_IDLE: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================
// TOKEN & SESSION
// ============================================================

/**
 * Token and session expiration times
 */
export const TOKEN_EXPIRY = {
  /** Session max age: 30 days in seconds */
  SESSION: 30 * 24 * 60 * 60,

  /** Refresh token expiry: 30 days in milliseconds */
  REFRESH_TOKEN: 30 * 24 * 60 * 60 * 1000,

  /** Password reset token: 1 hour in seconds */
  RESET_PASSWORD: 60 * 60,

  /** Email verification token: 24 hours in seconds */
  EMAIL_VERIFICATION: 24 * 60 * 60,
} as const;

// ============================================================
// VALIDATION
// ============================================================

/**
 * Input validation constraints
 */
export const VALIDATION = {
  /** Minimum password length */
  PASSWORD_MIN_LENGTH: 8,

  /** Maximum password length */
  PASSWORD_MAX_LENGTH: 100,

  /** Maximum text field length */
  TEXT_MAX_LENGTH: 1000,

  /** Maximum description length */
  DESCRIPTION_MAX_LENGTH: 5000,

  /** Minimum product price */
  MIN_PRICE: 0,

  /** Maximum product price */
  MAX_PRICE: 999999.99,
} as const;

// ============================================================
// BUSINESS LOGIC
// ============================================================

/**
 * Business logic constants
 */
export const BUSINESS = {
  /** Free shipping threshold in THB */
  FREE_SHIPPING_THRESHOLD: 1000,

  /** Standard shipping cost in THB */
  STANDARD_SHIPPING_COST: 50,

  /** Tax rate (7% VAT in Thailand) */
  TAX_RATE: 0.07,

  /** Maximum items in cart */
  MAX_CART_ITEMS: 50,

  /** Maximum quantity per item */
  MAX_ITEM_QUANTITY: 99,
} as const;

// ============================================================
// CACHE
// ============================================================

/**
 * Cache durations in seconds (for Next.js revalidation)
 */
export const CACHE = {
  /** Static content cache: 1 hour */
  STATIC: 3600,

  /** Product list cache: 5 minutes */
  PRODUCTS: 300,

  /** User profile cache: 1 minute */
  PROFILE: 60,

  /** Settings cache: 10 minutes */
  SETTINGS: 600,

  /** No cache */
  NO_CACHE: 0,
} as const;

// ============================================================
// EXPORT TYPES
// ============================================================

/**
 * TypeScript type helpers for constant values
 */
export type RateLimitKey = keyof typeof RATE_LIMITS;
export type AllowedMimeType = typeof FILE_LIMITS.ALLOWED_TYPES[number];
export type AllowedExtension = typeof FILE_LIMITS.ALLOWED_EXTENSIONS[number];
export type PageSizeOption = typeof PAGINATION.PAGE_SIZE_OPTIONS[number];
