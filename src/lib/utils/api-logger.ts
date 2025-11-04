/**
 * API Logger Utilities for Comprehensive Logging
 *
 * Provides structured logging with consistent format and required context
 * for all API endpoints. Helps track requests, errors, and security events.
 */

import logger from '@/lib/logger';
import { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

/**
 * Request context for logging
 */
export interface RequestContext {
  method: string;
  path: string;
  userId?: string | number;
  userEmail?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Sanitize data to remove sensitive information before logging
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
    'session',
    'refreshToken',
    'accessToken',
    'paymentProof', // May contain sensitive payment information
  ];

  const sanitized = { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();

    // Check if key contains sensitive field names
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Extract request context from NextRequest
 */
export function getRequestContext(
  request: NextRequest,
  session?: Session | null
): RequestContext {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';
  const requestId = request.headers.get('x-request-id') || generateRequestId();

  return {
    method: request.method,
    path: new URL(request.url).pathname,
    userId: session?.user?.id,
    userEmail: session?.user?.email || undefined,
    userRole: session?.user?.role || undefined,
    ip,
    userAgent,
    requestId,
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log API request
 */
export function logRequest(
  context: RequestContext,
  additionalData?: Record<string, any>
): void {
  logger.info('API Request', {
    ...context,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API response
 */
export function logResponse(
  context: RequestContext,
  statusCode: number,
  duration?: number,
  additionalData?: Record<string, any>
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  logger[level]('API Response', {
    ...context,
    statusCode,
    duration: duration ? `${duration}ms` : undefined,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API error with comprehensive context
 */
export function logError(
  context: RequestContext,
  error: Error | unknown,
  additionalData?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorName = error instanceof Error ? error.name : 'UnknownError';

  logger.error('API Error', {
    ...context,
    error: {
      name: errorName,
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    },
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log authentication events
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'register' | 'unauthorized' | 'forbidden',
  context: RequestContext,
  additionalData?: Record<string, any>
): void {
  const level = event === 'unauthorized' || event === 'forbidden' ? 'warn' : 'info';

  logger[level]('Auth Event', {
    event,
    ...context,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log security events (rate limiting, suspicious activity, etc.)
 */
export function logSecurityEvent(
  event: 'rate_limit' | 'invalid_input' | 'suspicious_activity' | 'access_denied',
  context: RequestContext,
  additionalData?: Record<string, any>
): void {
  logger.warn('Security Event', {
    event,
    ...context,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log database operations
 */
export function logDatabaseOperation(
  operation: 'create' | 'read' | 'update' | 'delete',
  model: string,
  context: RequestContext,
  additionalData?: Record<string, any>
): void {
  logger.info('Database Operation', {
    operation,
    model,
    ...context,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log business logic events (purchase, checkout, payment, etc.)
 */
export function logBusinessEvent(
  event: string,
  context: RequestContext,
  additionalData?: Record<string, any>
): void {
  logger.info('Business Event', {
    event,
    ...context,
    ...sanitizeLogData(additionalData),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Performance logging for slow operations
 */
export function logPerformance(
  operation: string,
  duration: number,
  context: RequestContext,
  threshold: number = 1000
): void {
  if (duration > threshold) {
    logger.warn('Slow Operation', {
      operation,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Utility to measure operation duration
 */
export class OperationTimer {
  private startTime: number;
  private operation: string;
  private context: RequestContext;

  constructor(operation: string, context: RequestContext) {
    this.startTime = Date.now();
    this.operation = operation;
    this.context = context;
  }

  end(additionalData?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;
    logPerformance(this.operation, duration, this.context);

    if (additionalData) {
      logger.debug(`${this.operation} completed`, {
        duration: `${duration}ms`,
        ...this.context,
        ...sanitizeLogData(additionalData),
      });
    }

    return duration;
  }
}
