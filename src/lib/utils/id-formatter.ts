/**
 * ID Formatter Utilities
 *
 * Provides functions to obfuscate sequential IDs and prevent enumeration attacks.
 *
 * Strategy:
 * 1. User IDs: Padded format (e.g., 10000000001) - keeps INT in DB, formats for display
 * 2. Order IDs: Amazon-style format (e.g., 702-1234567-8901) - stores as VARCHAR in DB
 */

// ============================================================================
// User ID Formatting (Padded Format)
// ============================================================================

/**
 * Base number for padded user IDs (makes IDs appear longer and professional)
 * Default: 10000000000 (11 digits)
 */
const USER_ID_BASE = parseInt(process.env.USER_ID_BASE || '10000000000', 10);

/**
 * Formats a sequential user ID to a padded string format
 *
 * @example
 * formatUserId(1) // "10000000001"
 * formatUserId(42) // "10000000042"
 * formatUserId(1234) // "10000001234"
 *
 * @param id - The sequential user ID from database
 * @returns Formatted user ID string
 */
export function formatUserId(id: number): string {
  if (typeof id !== 'number' || isNaN(id) || id < 1) {
    throw new Error(`Invalid user ID: ${id}. Must be a positive number.`);
  }

  return (USER_ID_BASE + id).toString();
}

/**
 * Parses a formatted user ID back to the original sequential ID
 *
 * @example
 * parseUserId("10000000001") // 1
 * parseUserId("10000000042") // 42
 * parseUserId("10000001234") // 1234
 *
 * @param formattedId - The formatted user ID string
 * @returns Original sequential user ID
 */
export function parseUserId(formattedId: string): number {
  const parsed = parseInt(formattedId, 10);

  if (isNaN(parsed) || parsed <= USER_ID_BASE) {
    throw new Error(`Invalid formatted user ID: ${formattedId}`);
  }

  return parsed - USER_ID_BASE;
}

/**
 * Validates if a string is a valid formatted user ID
 *
 * @param formattedId - The formatted user ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidFormattedUserId(formattedId: string): boolean {
  try {
    const parsed = parseInt(formattedId, 10);
    return !isNaN(parsed) && parsed > USER_ID_BASE;
  } catch {
    return false;
  }
}

// ============================================================================
// Order ID Generation (Amazon-style Format)
// ============================================================================

/**
 * Prefix for order IDs (region/type code)
 * Default: "702" (can be customized via env variable)
 */
const ORDER_ID_PREFIX = process.env.ORDER_ID_PREFIX || '702';

/**
 * Generates a unique Amazon-style order ID
 *
 * Format: {PREFIX}-{TIMESTAMP}-{RANDOM}
 * Example: "702-1234567-8901"
 *
 * Components:
 * - Prefix: 3-digit region/type code (default: 702)
 * - Timestamp: Last 7 digits of current timestamp
 * - Random: 4-digit random number
 *
 * @returns A unique order ID string
 */
export function generateOrderId(): string {
  // Get last 7 digits of current timestamp
  const timestamp = Date.now().toString().slice(-7);

  // Generate 4-digit random number (0000-9999)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `${ORDER_ID_PREFIX}-${timestamp}-${random}`;
}

/**
 * Validates if a string matches the order ID format
 *
 * Format: XXX-XXXXXXX-XXXX (3-7-4 digits separated by dashes)
 *
 * @param orderId - The order ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidOrderId(orderId: string): boolean {
  // Format: XXX-XXXXXXX-XXXX
  const orderIdRegex = /^\d{3}-\d{7}-\d{4}$/;
  return orderIdRegex.test(orderId);
}

/**
 * Extracts the timestamp component from an order ID
 *
 * @param orderId - The order ID (e.g., "702-1234567-8901")
 * @returns The timestamp string (e.g., "1234567")
 */
export function extractOrderTimestamp(orderId: string): string | null {
  if (!isValidOrderId(orderId)) {
    return null;
  }

  const parts = orderId.split('-');
  return parts[1];
}

/**
 * Extracts the prefix from an order ID
 *
 * @param orderId - The order ID (e.g., "702-1234567-8901")
 * @returns The prefix string (e.g., "702")
 */
export function extractOrderPrefix(orderId: string): string | null {
  if (!isValidOrderId(orderId)) {
    return null;
  }

  const parts = orderId.split('-');
  return parts[0];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely formats a user ID, returns null if invalid
 *
 * @param id - The user ID to format
 * @returns Formatted ID or null if invalid
 */
export function safeFormatUserId(id: number | null | undefined): string | null {
  if (id === null || id === undefined || id < 1) {
    return null;
  }

  try {
    return formatUserId(id);
  } catch {
    return null;
  }
}

/**
 * Safely parses a formatted user ID, returns null if invalid
 *
 * @param formattedId - The formatted user ID
 * @returns Parsed ID or null if invalid
 */
export function safeParseUserId(formattedId: string | null | undefined): number | null {
  if (!formattedId) {
    return null;
  }

  try {
    return parseUserId(formattedId);
  } catch {
    return null;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Type for formatted user ID (string representation)
 */
export type FormattedUserId = string;

/**
 * Type for order ID (Amazon-style format)
 */
export type OrderId = string;

/**
 * Type for sequential database user ID (number)
 */
export type SequentialUserId = number;
