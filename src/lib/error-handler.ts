import { NextResponse } from "next/server";
import logger from "./logger";
import * as Sentry from "@sentry/nextjs";

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  timestamp?: string;
}

/**
 * Centralized error handler for API routes
 * - Logs errors with Winston
 * - Reports errors to Sentry in production
 * - Returns sanitized error messages (hides stack traces in production)
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ErrorResponse> {
  const isDevelopment = process.env.NODE_ENV === "development";
  const timestamp = new Date().toISOString();

  // Log error
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(`[${context || "API"}] ${errorMessage}`, {
    stack: errorStack,
    timestamp,
  });

  // Report to Sentry in production
  if (!isDevelopment && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        context: context || "api",
      },
    });
  }

  // Return sanitized error response
  if (isDevelopment) {
    // In development, show detailed error information
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: {
          stack: errorStack,
          context,
          timestamp,
        },
      },
      { status: 500 }
    );
  } else {
    // In production, hide sensitive error details
    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred. Please try again later.",
        timestamp,
      },
      { status: 500 }
    );
  }
}

/**
 * Handles validation errors (400 Bad Request)
 */
export function handleValidationError(
  message: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  logger.warn(`Validation error: ${message}`, { details });

  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status: 400 }
  );
}

/**
 * Handles authentication errors (401 Unauthorized)
 */
export function handleAuthError(message?: string): NextResponse<ErrorResponse> {
  const errorMessage = message || "Authentication required";
  logger.warn(`Auth error: ${errorMessage}`);

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 401 }
  );
}

/**
 * Handles authorization errors (403 Forbidden)
 */
export function handleForbiddenError(
  message?: string
): NextResponse<ErrorResponse> {
  const errorMessage = message || "You do not have permission to access this resource";
  logger.warn(`Forbidden: ${errorMessage}`);

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 403 }
  );
}

/**
 * Handles not found errors (404 Not Found)
 */
export function handleNotFoundError(
  resource?: string
): NextResponse<ErrorResponse> {
  const errorMessage = resource ? `${resource} not found` : "Resource not found";
  logger.warn(`Not found: ${errorMessage}`);

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 404 }
  );
}
