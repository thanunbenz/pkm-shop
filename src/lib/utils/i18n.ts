/**
 * Internationalization (i18n) Utility
 *
 * Helper functions for translating error messages and success messages
 * with support for Thai and English languages.
 *
 * Related: Issue #71 - Inconsistent Error Messages
 */

import { messages, type Language, type MessageKey } from "@/config/i18n/messages";

// Re-export types for convenience
export type { Language, MessageKey } from "@/config/i18n/messages";

/**
 * Default language (can be overridden by environment variable)
 */
const DEFAULT_LANGUAGE: Language = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as Language) || "th";

/**
 * Get translated message by key and language
 *
 * @param key - Message key from messages dictionary
 * @param lang - Language code ("th" or "en"), defaults to Thai
 * @param params - Optional parameters for string interpolation
 * @returns Translated message string
 *
 * @example
 * ```typescript
 * getMessage("auth.invalidCredentials", "en")
 * // Returns: "Invalid email or password"
 *
 * getMessage("upload.tooLarge", "th", { size: "5" })
 * // Returns: "ไฟล์ใหญ่เกินไป ขนาดสูงสุด: 5MB"
 * ```
 */
export function getMessage(
  key: MessageKey,
  lang: Language = DEFAULT_LANGUAGE,
  params?: Record<string, string>
): string {
  let message: string = messages[lang][key];

  // Interpolate parameters if provided
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      message = message.replace(`{${paramKey}}`, value);
    });
  }

  return message;
}

/**
 * Get translated message in both languages
 *
 * @param key - Message key from messages dictionary
 * @param params - Optional parameters for string interpolation
 * @returns Object with Thai and English translations
 *
 * @example
 * ```typescript
 * getBilingualMessage("auth.invalidCredentials")
 * // Returns: {
 * //   th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
 * //   en: "Invalid email or password"
 * // }
 * ```
 */
export function getBilingualMessage(
  key: MessageKey,
  params?: Record<string, string>
): { th: string; en: string } {
  return {
    th: getMessage(key, "th", params),
    en: getMessage(key, "en", params),
  };
}

/**
 * Get message based on Accept-Language header
 *
 * @param key - Message key
 * @param acceptLanguage - Accept-Language header value
 * @param params - Optional parameters
 * @returns Translated message
 *
 * @example
 * ```typescript
 * getMessageFromHeader("auth.required", "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7")
 * // Returns: "กรุณาเข้าสู่ระบบ"
 * ```
 */
export function getMessageFromHeader(
  key: MessageKey,
  acceptLanguage: string | null,
  params?: Record<string, string>
): string {
  const lang = parseAcceptLanguage(acceptLanguage);
  return getMessage(key, lang, params);
}

/**
 * Parse Accept-Language header to determine language
 *
 * @param acceptLanguage - Accept-Language header value
 * @returns Language code ("th" or "en")
 *
 * @example
 * ```typescript
 * parseAcceptLanguage("th-TH,th;q=0.9,en-US;q=0.8")
 * // Returns: "th"
 *
 * parseAcceptLanguage("en-US,en;q=0.9")
 * // Returns: "en"
 * ```
 */
export function parseAcceptLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  // Check if Thai is preferred
  if (acceptLanguage.toLowerCase().includes("th")) {
    return "th";
  }

  // Check if English is preferred
  if (acceptLanguage.toLowerCase().includes("en")) {
    return "en";
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get language from request headers (for server-side use)
 *
 * @param headers - Request headers object
 * @returns Language code
 */
export function getLanguageFromRequest(headers: Headers): Language {
  const acceptLanguage = headers.get("accept-language");
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Create error response with translated message
 *
 * @param key - Message key for error
 * @param lang - Language preference
 * @param params - Optional parameters
 * @returns Error message string
 */
export function getErrorMessage(
  key: MessageKey,
  lang: Language = DEFAULT_LANGUAGE,
  params?: Record<string, string>
): string {
  return getMessage(key, lang, params);
}

/**
 * Create success response with translated message
 *
 * @param key - Message key for success message
 * @param lang - Language preference
 * @param params - Optional parameters
 * @returns Success message string
 */
export function getSuccessMessage(
  key: MessageKey,
  lang: Language = DEFAULT_LANGUAGE,
  params?: Record<string, string>
): string {
  return getMessage(key, lang, params);
}

/**
 * Detect browser language (for client-side use)
 *
 * @returns Detected language code
 */
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = window.navigator.language.toLowerCase();

  if (browserLang.startsWith("th")) {
    return "th";
  }

  if (browserLang.startsWith("en")) {
    return "en";
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): Language[] {
  return ["th", "en"];
}

/**
 * Check if a language code is valid
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === "th" || lang === "en";
}

/**
 * Get language name in native script
 */
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    th: "ไทย",
    en: "English",
  };
  return names[lang];
}

/**
 * Format validation errors with translated messages
 *
 * @param errors - Object containing field errors
 * @param lang - Language preference
 * @returns Formatted error string
 */
export function formatValidationErrors(
  errors: Record<string, string[]>,
  lang: Language = DEFAULT_LANGUAGE
): string {
  const prefix = getMessage("validation.failed", lang);
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");

  return `${prefix}: ${errorMessages}`;
}

/**
 * Get translated Zod error messages
 * Maps Zod error codes to our message keys
 *
 * @param zodError - Zod validation error code
 * @param lang - Language preference
 * @returns Translated error message
 */
export function getZodErrorMessage(
  zodError: string,
  field?: string,
  lang: Language = DEFAULT_LANGUAGE
): string {
  // Map Zod error codes to our message keys
  const errorMap: Record<string, MessageKey> = {
    invalid_type: "validation.invalidData",
    invalid_string: "validation.invalidData",
    too_small: field === "password" ? "validation.passwordTooShort" : "validation.invalidData",
    too_big: "validation.invalidData",
    invalid_email: "validation.emailInvalid",
    required: "validation.invalidData",
  };

  const messageKey = errorMap[zodError] || "validation.failed";
  return getMessage(messageKey, lang);
}
