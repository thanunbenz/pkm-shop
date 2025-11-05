/**
 * Pagination Utility
 *
 * Standardized pagination helpers for consistent API responses and query optimization.
 * Helps prevent N+1 queries by providing clear structure for includes.
 *
 * Related: Issue #74 - N+1 Query Potential
 */

import { PAGINATION } from "@/config/app-constants";

/**
 * Input parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata in API response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Standardized paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Offset-based pagination metadata (alternative style used in audit logs)
 */
export interface OffsetPaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Parse and validate pagination parameters from request
 *
 * @param params - Pagination parameters from query string
 * @returns Validated pagination parameters for Prisma
 *
 * @example
 * ```typescript
 * const { page, take, skip } = getPaginationParams({
 *   page: 2,
 *   limit: 20
 * });
 * // Returns: { page: 2, take: 20, skip: 20 }
 * ```
 */
export function getPaginationParams(
  params: PaginationParams = {}
): { page: number; take: number; skip: number } {
  // Validate and constrain page number
  const page = Math.max(1, params.page || 1);

  // Validate and constrain limit
  const limit = Math.min(
    Math.max(1, params.limit || PAGINATION.DEFAULT_PAGE_SIZE),
    PAGINATION.MAX_PAGE_SIZE
  );

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Create standardized pagination metadata for API response
 *
 * @param data - The data array being returned
 * @param total - Total number of items across all pages
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata object
 *
 * @example
 * ```typescript
 * const pagination = createPaginationMeta(users, 100, 2, 20);
 * // Returns:
 * // {
 * //   page: 2,
 * //   limit: 20,
 * //   total: 100,
 * //   totalPages: 5,
 * //   hasNext: true,
 * //   hasPrev: true
 * // }
 * ```
 */
export function createPaginationMeta(
  data: unknown[],
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create complete paginated response
 *
 * @param data - The data array to return
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Complete paginated response object
 *
 * @example
 * ```typescript
 * const response = createPaginatedResponse(users, 100, 2, 20);
 * // Returns:
 * // {
 * //   success: true,
 * //   data: [...users],
 * //   pagination: { page: 2, limit: 20, total: 100, ... }
 * // }
 * ```
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: createPaginationMeta(data, total, page, limit),
  };
}

/**
 * Parse offset-based pagination parameters (alternative to page-based)
 *
 * @param offset - Starting index
 * @param limit - Number of items to return
 * @returns Validated offset and limit
 *
 * @example
 * ```typescript
 * const { offset, limit } = getOffsetPaginationParams(40, 20);
 * // Returns: { offset: 40, limit: 20 }
 * ```
 */
export function getOffsetPaginationParams(
  offset?: number,
  limit?: number
): { offset: number; limit: number } {
  return {
    offset: Math.max(0, offset || 0),
    limit: Math.min(
      Math.max(1, limit || PAGINATION.DEFAULT_PAGE_SIZE),
      PAGINATION.MAX_PAGE_SIZE
    ),
  };
}

/**
 * Create offset-based pagination metadata
 *
 * @param total - Total number of items
 * @param offset - Current offset
 * @param limit - Items per request
 * @param currentCount - Number of items in current result
 * @returns Offset pagination metadata
 *
 * @example
 * ```typescript
 * const meta = createOffsetPaginationMeta(100, 40, 20, 20);
 * // Returns:
 * // {
 * //   total: 100,
 * //   offset: 40,
 * //   limit: 20,
 * //   hasMore: true
 * // }
 * ```
 */
export function createOffsetPaginationMeta(
  total: number,
  offset: number,
  limit: number,
  currentCount: number
): OffsetPaginationMeta {
  return {
    total,
    offset,
    limit,
    hasMore: offset + currentCount < total,
  };
}

/**
 * Calculate page number from offset and limit
 *
 * @param offset - Current offset
 * @param limit - Items per page
 * @returns Calculated page number (1-indexed)
 *
 * @example
 * ```typescript
 * const page = offsetToPage(40, 20);
 * // Returns: 3 (third page)
 * ```
 */
export function offsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}

/**
 * Calculate offset from page number and limit
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Calculated offset
 *
 * @example
 * ```typescript
 * const offset = pageToOffset(3, 20);
 * // Returns: 40
 * ```
 */
export function pageToOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Type guard to check if response is paginated
 *
 * @param response - Response object to check
 * @returns True if response has pagination metadata
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "data" in response &&
    "pagination" in response &&
    Array.isArray((response as any).data)
  );
}
