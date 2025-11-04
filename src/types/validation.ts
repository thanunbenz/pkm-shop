/**
 * Type definitions for validation and error handling
 */

import { ZodIssue } from 'zod';

/**
 * Formatted validation error for API responses
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Format Zod issues into user-friendly error details
 */
export function formatZodIssues(issues: ZodIssue[]): ValidationErrorDetail[] {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Prisma where clause type for dynamic filtering
 * Used when building dynamic query filters
 */
export type PrismaWhereClause = Record<string, unknown>;
