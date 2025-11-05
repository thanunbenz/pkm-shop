import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { getMessage, getLanguageFromRequest, type Language } from "./i18n";

/**
 * Format Zod validation errors into user-friendly messages with i18n support
 */
export function formatZodError(
  error: ZodError,
  lang: Language = "th"
): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  // Safety check for error.issues (ZodError uses 'issues', not 'errors')
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return { _error: [getMessage("validation.failed", lang)] };
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
 * Get first error message from Zod error with i18n support
 */
export function getFirstZodError(error: ZodError, lang: Language = "th"): string {
  // Safety check for error.issues
  if (!error || !error.issues || !Array.isArray(error.issues) || error.issues.length === 0) {
    return getMessage("validation.failed", lang);
  }
  return error.issues[0]?.message || getMessage("validation.failed", lang);
}

/**
 * Create validation error response with i18n support
 */
export function validationErrorResponse(
  error: ZodError,
  status: number = 400,
  lang: Language = "th"
) {
  return NextResponse.json(
    {
      success: false,
      error: getMessage("validation.failed", lang),
      errors: formatZodError(error, lang),
    },
    { status }
  );
}

/**
 * Create validation error response with language detection from request
 */
export function validationErrorResponseWithLang(
  error: ZodError,
  headers: Headers,
  status: number = 400
) {
  const lang = getLanguageFromRequest(headers);
  return validationErrorResponse(error, status, lang);
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
      response: validationErrorResponse(result.error!),
    };
  }

  return {
    success: true,
    data: result.data!,
  };
}

/**
 * Extract validation errors for form display with i18n support
 */
export function extractFormErrors(error: ZodError, lang: Language = "th"): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  // Safety check for error.issues
  if (!error || !error.issues || !Array.isArray(error.issues)) {
    return { _error: getMessage("validation.failed", lang) };
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
