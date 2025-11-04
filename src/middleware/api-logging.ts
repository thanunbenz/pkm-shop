/**
 * API Logging Middleware
 *
 * Automatically logs all API requests and responses with comprehensive context.
 * This middleware should be applied to all API routes for consistent logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import {
  getRequestContext,
  logRequest,
  logResponse,
  logError,
  logSecurityEvent,
} from '@/lib/utils/api-logger';

/**
 * Paths that should not be logged (to avoid excessive logging)
 */
const EXCLUDED_PATHS = [
  '/api/auth/session', // Too frequent
  '/api/health', // Health checks
  '/_next', // Next.js internal
  '/favicon.ico',
];

/**
 * Check if path should be logged
 */
function shouldLogPath(path: string): boolean {
  return !EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded));
}

/**
 * API Request/Response Logging Middleware
 *
 * Usage in API routes:
 * ```typescript
 * import { withApiLogging } from '@/middleware/api-logging';
 *
 * async function handler(request: NextRequest) {
 *   // Your handler logic
 * }
 *
 * export const POST = withApiLogging(handler);
 * ```
 */
export function withApiLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();
    const pathname = new URL(request.url).pathname;

    // Skip logging for excluded paths
    if (!shouldLogPath(pathname)) {
      return handler(request, ...args);
    }

    // Get session for context
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      // Session fetch error - continue without session context
    }

    // Get request context
    const context = getRequestContext(request, session);

    // Log incoming request
    logRequest(context, {
      query: Object.fromEntries(new URL(request.url).searchParams),
    });

    try {
      // Execute the handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Log response
      logResponse(context, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logError(context, error, {
        duration: `${duration}ms`,
      });

      // Re-throw to let error handling middleware handle it
      throw error;
    }
  };
}

/**
 * Enhanced logging wrapper with additional features
 *
 * Includes:
 * - Request/response logging
 * - Performance monitoring
 * - Security event logging
 * - Business event tracking
 */
export function withEnhancedLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options?: {
    logRequestBody?: boolean;
    logResponseBody?: boolean;
    performanceThreshold?: number;
  }
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();
    const pathname = new URL(request.url).pathname;

    // Skip logging for excluded paths
    if (!shouldLogPath(pathname)) {
      return handler(request, ...args);
    }

    // Get session for context
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      // Session fetch error - continue without session context
    }

    // Get request context
    const context = getRequestContext(request, session);

    // Optionally log request body
    let requestData: any = {
      query: Object.fromEntries(new URL(request.url).searchParams),
    };

    if (options?.logRequestBody && request.method !== 'GET') {
      try {
        // Clone request to read body without consuming it
        const clonedRequest = request.clone();
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          requestData.body = await clonedRequest.json();
        }
      } catch (error) {
        // Failed to parse body - skip
      }
    }

    // Log incoming request
    logRequest(context, requestData);

    try {
      // Execute the handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Log response
      let responseData: any = {};
      if (options?.logResponseBody) {
        try {
          const clonedResponse = response.clone();
          const contentType = response.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            responseData.body = await clonedResponse.json();
          }
        } catch (error) {
          // Failed to parse response - skip
        }
      }

      logResponse(context, response.status, duration, responseData);

      // Log security events for certain status codes
      if (response.status === 401) {
        logSecurityEvent('access_denied', context, {
          reason: 'Unauthorized',
        });
      } else if (response.status === 403) {
        logSecurityEvent('access_denied', context, {
          reason: 'Forbidden',
        });
      } else if (response.status === 429) {
        logSecurityEvent('rate_limit', context);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logError(context, error, {
        duration: `${duration}ms`,
      });

      // Re-throw to let error handling middleware handle it
      throw error;
    }
  };
}

/**
 * Log wrapper for functions (not route handlers)
 *
 * Usage:
 * ```typescript
 * const result = await withLogging('operation-name', context, async () => {
 *   return await someOperation();
 * });
 * ```
 */
export async function withLogging<T>(
  operationName: string,
  context: any,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logResponse(context, 200, duration, {
      operation: operationName,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(context, error, {
      operation: operationName,
      duration: `${duration}ms`,
    });

    throw error;
  }
}
