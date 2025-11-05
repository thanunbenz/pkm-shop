/**
 * API Response Helpers
 *
 * Utility functions to create standardized API responses across all endpoints.
 * Ensures consistent response format, proper status codes, and helpful metadata.
 *
 * Related: Issue #77 - Inconsistent API Responses
 */

import { NextResponse } from "next/server";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedApiResponse,
  OffsetPaginatedApiResponse,
  ApiErrorCode,
} from "@/types/api-response";
import { randomUUID } from "crypto";

/**
 * Generate request ID for tracing
 */
function generateRequestId(): string {
  return `req_${randomUUID().split("-")[0]}`;
}

/**
 * Create standardized success response
 *
 * @param data - Response data
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @param meta - Additional metadata
 * @returns NextResponse with standardized format
 *
 * @example
 * ```typescript
 * return successResponse({ id: 1, name: "Product" }, "Product created", 201);
 * ```
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  meta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create standardized error response
 *
 * @param error - Error message
 * @param status - HTTP status code (default: 400)
 * @param details - Additional error details
 * @param code - Error code for client-side handling
 * @param meta - Additional metadata
 * @returns NextResponse with standardized error format
 *
 * @example
 * ```typescript
 * return errorResponse("Product not found", 404, { productId: 123 }, "NOT_FOUND");
 * ```
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown,
  code?: ApiErrorCode | string,
  meta?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    ...(details !== undefined && { details }),
    ...(code !== undefined && { code }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...(meta || {}),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create paginated success response (page-based)
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @param meta - Additional metadata
 * @returns NextResponse with paginated format
 *
 * @example
 * ```typescript
 * return paginatedResponse(
 *   users,
 *   {
 *     page: 1,
 *     limit: 10,
 *     total: 100,
 *     totalPages: 10,
 *     hasNext: true,
 *     hasPrev: false
 *   }
 * );
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginatedApiResponse<T>["pagination"],
  message?: string,
  meta?: Record<string, unknown>
): NextResponse<PaginatedApiResponse<T>> {
  const response: PaginatedApiResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Create offset-based paginated response
 *
 * @param data - Array of items
 * @param pagination - Offset pagination metadata
 * @param message - Optional success message
 * @param meta - Additional metadata
 * @returns NextResponse with offset paginated format
 *
 * @example
 * ```typescript
 * return offsetPaginatedResponse(
 *   logs,
 *   {
 *     total: 100,
 *     limit: 20,
 *     offset: 0,
 *     hasMore: true
 *   }
 * );
 * ```
 */
export function offsetPaginatedResponse<T>(
  data: T[],
  pagination: OffsetPaginatedApiResponse<T>["pagination"],
  message?: string,
  meta?: Record<string, unknown>
): NextResponse<OffsetPaginatedApiResponse<T>> {
  const response: OffsetPaginatedApiResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Common error response shortcuts
 */

export function unauthorizedResponse(
  message: string = "Authentication required",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 401, details, "UNAUTHORIZED");
}

export function forbiddenResponse(
  message: string = "Access forbidden",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 403, details, "FORBIDDEN");
}

export function notFoundResponse(
  message: string = "Resource not found",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 404, details, "NOT_FOUND");
}

export function validationErrorResponse(
  message: string = "Validation error",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 400, details, "VALIDATION_ERROR");
}

export function conflictResponse(
  message: string = "Resource already exists",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 409, details, "CONFLICT");
}

export function rateLimitResponse(
  message: string = "Rate limit exceeded",
  retryAfter?: string
): NextResponse<ApiErrorResponse> {
  const response = errorResponse(message, 429, undefined, "RATE_LIMIT_EXCEEDED");

  if (retryAfter) {
    response.headers.set("Retry-After", retryAfter);
  }

  return response;
}

export function serverErrorResponse(
  message: string = "Internal server error",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 500, details, "INTERNAL_SERVER_ERROR");
}

/**
 * Helper to create response with custom headers
 *
 * @param response - Base response
 * @param headers - Headers to add
 * @returns Response with additional headers
 *
 * @example
 * ```typescript
 * return withHeaders(
 *   successResponse(data),
 *   {
 *     "Cache-Control": "max-age=3600",
 *     "X-Custom-Header": "value"
 *   }
 * );
 * ```
 */
export function withHeaders<T>(
  response: NextResponse<T>,
  headers: Record<string, string>
): NextResponse<T> {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Helper to create response with rate limit headers
 *
 * @param response - Base response
 * @param limit - Rate limit
 * @param remaining - Remaining requests
 * @param resetTime - Reset timestamp
 * @returns Response with rate limit headers
 */
export function withRateLimitHeaders<T>(
  response: NextResponse<T>,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse<T> {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetTime.toString());

  return response;
}

/**
 * Helper to create response with CORS headers
 *
 * @param response - Base response
 * @param origin - Allowed origin (default: *)
 * @returns Response with CORS headers
 */
export function withCorsHeaders<T>(
  response: NextResponse<T>,
  origin: string = "*"
): NextResponse<T> {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}
