/**
 * Utility functions for safe parsing of primitive types
 * Prevents NaN values from reaching the database
 */

// Type for values that can be parsed to numbers
type Parseable = string | number | null | undefined;

/**
 * Safely parse a value to integer
 * @param value - Value to parse (string, number, null, or undefined)
 * @param fieldName - Name of field for error message
 * @returns Parsed integer
 * @throws Error if value cannot be parsed to valid integer
 */
export function parseIntSafe(value: Parseable, fieldName: string): number {
  const parsed = parseInt(String(value));
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return parsed;
}

/**
 * Safely parse a value to float
 * @param value - Value to parse (string, number, null, or undefined)
 * @param fieldName - Name of field for error message
 * @returns Parsed float
 * @throws Error if value cannot be parsed to valid float
 */
export function parseFloatSafe(value: Parseable, fieldName: string): number {
  const parsed = parseFloat(String(value));
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return parsed;
}

/**
 * Safely parse a value to positive integer
 * @param value - Value to parse (string, number, null, or undefined)
 * @param fieldName - Name of field for error message
 * @returns Parsed positive integer
 * @throws Error if value cannot be parsed or is not positive
 */
export function parsePositiveIntSafe(value: Parseable, fieldName: string): number {
  const parsed = parseIntSafe(value, fieldName);
  if (parsed <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return parsed;
}

/**
 * Safely parse a value to non-negative integer
 * @param value - Value to parse (string, number, null, or undefined)
 * @param fieldName - Name of field for error message
 * @returns Parsed non-negative integer
 * @throws Error if value cannot be parsed or is negative
 */
export function parseNonNegativeIntSafe(value: Parseable, fieldName: string): number {
  const parsed = parseIntSafe(value, fieldName);
  if (parsed < 0) {
    throw new Error(`${fieldName} must be non-negative`);
  }
  return parsed;
}
