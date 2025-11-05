/**
 * Standardized API Response Types
 *
 * Consistent response formats for all API endpoints to improve:
 * - Client-side error handling
 * - Type safety with TypeScript
 * - Debugging and logging
 * - API documentation
 *
 * Related: Issue #77 - Inconsistent API Responses
 */

/**
 * Standard success response format
 *
 * @example
 * {
 *   success: true,
 *   data: { id: 1, name: "Product" },
 *   message: "Product created successfully",
 *   meta: {
 *     timestamp: "2025-01-05T10:00:00.000Z",
 *     requestId: "req_123"
 *   }
 * }
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Standard error response format
 *
 * @example
 * {
 *   success: false,
 *   error: "Product not found",
 *   details: { productId: 123 },
 *   code: "PRODUCT_NOT_FOUND",
 *   meta: {
 *     timestamp: "2025-01-05T10:00:00.000Z",
 *     requestId: "req_123"
 *   }
 * }
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated success response format
 *
 * @example
 * {
 *   success: true,
 *   data: [...items],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     total: 100,
 *     totalPages: 10,
 *     hasNext: true,
 *     hasPrev: false
 *   },
 *   meta: {
 *     timestamp: "2025-01-05T10:00:00.000Z"
 *   }
 * }
 */
export interface PaginatedApiResponse<T = unknown> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Offset-based paginated response (alternative style)
 *
 * Used for audit logs and similar endpoints
 */
export interface OffsetPaginatedApiResponse<T = unknown> extends ApiSuccessResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Standard error codes for consistent error handling
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resources
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Server Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",

  // Business Logic
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  INVALID_OPERATION = "INVALID_OPERATION",
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: ApiResponse
): response is PaginatedApiResponse<T> {
  return (
    isSuccessResponse(response) &&
    "pagination" in response &&
    typeof response.pagination === "object" &&
    response.pagination !== null
  );
}
