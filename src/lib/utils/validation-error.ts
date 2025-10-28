import { ZodError } from "zod";
import { NextResponse } from "next/server";

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatZodError(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  // Safety check for error.issues (ZodError uses 'issues', not 'errors')
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return { _error: ["Validation failed"] };
  }

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  return formattedErrors;
}

/**
 * Get first error message from Zod error
 */
export function getFirstZodError(error: ZodError): string {
  // Safety check for error.issues
  if (!error || !error.issues || !Array.isArray(error.issues) || error.issues.length === 0) {
    return "Validation failed";
  }
  return error.issues[0]?.message || "Validation failed";
}

/**
 * Create validation error response
 */
export function validationErrorResponse(error: ZodError, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors: formatZodError(error),
    },
    { status }
  );
}

/**
 * Validate data with Zod schema and return error response if invalid
 * @returns null if valid, NextResponse if invalid
 */
export function validateOrRespond<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } },
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: validationErrorResponse(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Extract validation errors for form display
 */
export function extractFormErrors(error: ZodError): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  // Safety check for error.issues
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return { _error: "Validation failed" };
  }

  error.issues.forEach((err) => {
    const field = err.path[0] as string;
    if (field && !errors[field]) {
      errors[field] = err.message;
    }
  });

  return errors;
}

/**
 * Check if error is a Zod error
 */
export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}
