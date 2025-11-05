/**
 * useTranslation Hook
 *
 * React hook for client-side i18n translation support.
 * Detects browser language and provides translation functions.
 *
 * Related: Issue #71 - Inconsistent Error Messages
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { messages, type Language, type MessageKey } from "@/config/i18n/messages";

/**
 * Get translated message (client-side version)
 */
function getClientMessage(
  key: MessageKey,
  lang: Language,
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
 * Detect browser language preference
 */
function detectLanguage(): Language {
  if (typeof window === "undefined") {
    return "th";
  }

  // Check localStorage first
  const stored = localStorage.getItem("preferred-language");
  if (stored && (stored === "th" || stored === "en")) {
    return stored as Language;
  }

  // Detect from browser
  const browserLang = window.navigator.language.toLowerCase();

  if (browserLang.startsWith("th")) {
    return "th";
  }

  if (browserLang.startsWith("en")) {
    return "en";
  }

  return "th"; // Default to Thai
}

/**
 * Custom hook for translation
 *
 * @returns Translation utilities
 *
 * @example
 * ```typescript
 * function Component() {
 *   const { t, language, setLanguage, tBoth } = useTranslation();
 *
 *   return (
 *     <div>
 *       <p>{t("auth.required")}</p>
 *       <button onClick={() => setLanguage("en")}>English</button>
 *       <button onClick={() => setLanguage("th")}>ไทย</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<Language>("th");

  // Initialize language on mount
  useEffect(() => {
    const detected = detectLanguage();
    setLanguageState(detected);
  }, []);

  /**
   * Translate message key to current language
   */
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string>): string => {
      return getClientMessage(key, language, params);
    },
    [language]
  );

  /**
   * Get translation in both languages
   */
  const tBoth = useCallback(
    (key: MessageKey, params?: Record<string, string>) => {
      return {
        th: getClientMessage(key, "th", params),
        en: getClientMessage(key, "en", params),
      };
    },
    []
  );

  /**
   * Get translation in specific language
   */
  const tLang = useCallback(
    (key: MessageKey, lang: Language, params?: Record<string, string>): string => {
      return getClientMessage(key, lang, params);
    },
    []
  );

  /**
   * Set language and persist to localStorage
   */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", lang);
    }
  }, []);

  /**
   * Toggle between Thai and English
   */
  const toggleLanguage = useCallback(() => {
    setLanguage(language === "th" ? "en" : "th");
  }, [language, setLanguage]);

  return {
    /** Current language */
    language,
    /** Set language preference */
    setLanguage,
    /** Toggle between Thai and English */
    toggleLanguage,
    /** Translate to current language */
    t,
    /** Get translation in both languages */
    tBoth,
    /** Translate to specific language */
    tLang,
  };
}

/**
 * Language selector component helper
 *
 * @example
 * ```typescript
 * function LanguageSelector() {
 *   const { language, setLanguage, getLanguageName } = useTranslation();
 *
 *   return (
 *     <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
 *       <option value="th">ไทย</option>
 *       <option value="en">English</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    th: "ไทย",
    en: "English",
  };
  return names[lang];
}
