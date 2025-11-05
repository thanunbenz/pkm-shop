# I18N Implementation Guide (Internationalization)

**Created:** 2025-01-05
**Issue:** #71 - Inconsistent Error Messages (Thai vs English)
**Status:** ✅ Complete
**Version:** 1.0

---

## 📋 Overview

This document describes the internationalization (i18n) system implemented for PKM Shop to provide consistent bilingual support (Thai and English) throughout the application.

### Problem Solved

**Before:**
- Inconsistent error messages (some in Thai, some in English)
- No standardized translation system
- Hardcoded messages scattered across codebase
- Poor user experience for non-Thai speakers

**After:**
- Centralized message dictionary with 100+ translations
- Consistent Thai/English bilingual support
- Automatic language detection from browser/headers
- Type-safe message keys with TypeScript
- Easy to add new messages or languages

---

## 🏗️ Architecture

### File Structure

```
src/
├── config/
│   └── i18n/
│       └── messages.ts              # Centralized message dictionary
├── lib/
│   └── utils/
│       ├── i18n.ts                  # Server-side i18n utilities
│       ├── api-response.ts          # API responses with i18n support
│       └── validation-error.ts      # Validation errors with i18n
└── hooks/
    └── useTranslation.ts            # Client-side React hook

docs/
└── 03-development/
    └── I18N_IMPLEMENTATION.md       # This file
```

### Components

1. **Message Dictionary** ([src/config/i18n/messages.ts](../../src/config/i18n/messages.ts))
   - Contains all translations in Thai and English
   - 100+ message keys organized by category
   - Type-safe with TypeScript

2. **Server-side Utilities** ([src/lib/utils/i18n.ts](../../src/lib/utils/i18n.ts))
   - `getMessage()` - Get translated message by key
   - `getLanguageFromRequest()` - Detect language from headers
   - `getBilingualMessage()` - Get both Thai and English

3. **Client-side Hook** ([src/hooks/useTranslation.ts](../../src/hooks/useTranslation.ts))
   - `useTranslation()` - React hook for components
   - Auto-detects browser language
   - Persists preference to localStorage

4. **API Response Integration** ([src/lib/utils/api-response.ts](../../src/lib/utils/api-response.ts))
   - `errorResponseI18n()` - Error responses with translation
   - `successResponseI18n()` - Success responses with translation
   - Auto-detection versions available

---

## 🚀 Usage

### 1. Server-Side (API Routes)

#### Basic Usage

```typescript
import { getMessage, getLanguageFromRequest } from "@/lib/utils/i18n";

export async function GET(request: NextRequest) {
  const lang = getLanguageFromRequest(request.headers);

  const message = getMessage("auth.unauthorized", lang);
  // Thai: "คุณไม่มีสิทธิ์ในการดำเนินการนี้"
  // English: "You are not authorized to perform this action"

  return NextResponse.json({ error: message }, { status: 401 });
}
```

#### With API Response Helpers

```typescript
import { errorResponseWithLang, successResponseWithLang } from "@/lib/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const user = await createUser(data);

    // Auto-detects language from request headers
    return successResponseWithLang(
      user,
      "register.success",  // Message key
      request.headers,
      201
    );
  } catch (error) {
    return errorResponseWithLang(
      "register.error",
      request.headers,
      500
    );
  }
}
```

#### With String Interpolation

```typescript
import { getMessage } from "@/lib/utils/i18n";

const message = getMessage("upload.tooLarge", "en", { size: "5" });
// Returns: "File too large. Maximum size: 5MB"

const messageTh = getMessage("upload.tooLarge", "th", { size: "5" });
// Returns: "ไฟล์ใหญ่เกินไป ขนาดสูงสุด: 5MB"
```

#### With Validation Errors

```typescript
import { validationErrorResponseWithLang } from "@/lib/utils/validation-error";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const result = schema.safeParse(await request.json());

  if (!result.success) {
    // Auto-detects language and returns translated error
    return validationErrorResponseWithLang(
      result.error,
      request.headers
    );
  }

  // Continue...
}
```

---

### 2. Client-Side (React Components)

#### Basic Usage

```typescript
"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function MyComponent() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div>
      <p>{t("auth.required")}</p>
      {/* Displays: "กรุณาเข้าสู่ระบบ" in Thai */}

      <button onClick={() => setLanguage("en")}>
        English
      </button>
      <button onClick={() => setLanguage("th")}>
        ไทย
      </button>
    </div>
  );
}
```

#### Error Handling with Toast

```typescript
"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { t } = useTranslation();

  async function handleSubmit() {
    try {
      const response = await fetch("/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t("profile.updateSuccess"));
      } else {
        toast.error(result.error || t("profile.updateError"));
      }
    } catch (error) {
      toast.error(t("error.unexpected"));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### With String Interpolation

```typescript
const { t } = useTranslation();

const message = t("upload.invalidType", {
  types: "JPG, PNG, PDF"
});
// Thai: "ประเภทไฟล์ไม่ถูกต้อง ประเภทที่อนุญาต: JPG, PNG, PDF"
// English: "Invalid file type. Allowed types: JPG, PNG, PDF"
```

#### Language Selector Component

```typescript
"use client";

import { useTranslation, getLanguageName } from "@/hooks/useTranslation";

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage("th")}
        className={language === "th" ? "font-bold" : ""}
      >
        {getLanguageName("th")}
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={language === "en" ? "font-bold" : ""}
      >
        {getLanguageName("en")}
      </button>
    </div>
  );
}
```

---

## 📖 Message Dictionary

### Available Message Categories

1. **Authentication & Authorization** (`auth.*`)
2. **Registration** (`register.*`)
3. **Validation** (`validation.*`)
4. **Profile** (`profile.*`)
5. **Products** (`product.*`)
6. **Cart** (`cart.*`)
7. **Purchases/Orders** (`purchase.*`)
8. **Codes** (`code.*`)
9. **Banners** (`banner.*`)
10. **Upload** (`upload.*`)
11. **Settings** (`settings.*`)
12. **Rate Limiting** (`rateLimit.*`)
13. **General Errors** (`error.*`)
14. **Success Messages** (`success.*`)

### Example Messages

```typescript
// Authentication
"auth.required"           // "กรุณาเข้าสู่ระบบ" / "Authentication required"
"auth.unauthorized"       // "คุณไม่มีสิทธิ์..." / "You are not authorized..."
"auth.incorrectPassword"  // "รหัสผ่านไม่ถูกต้อง" / "Incorrect password"

// Validation
"validation.emailInvalid"     // "รูปแบบอีเมลไม่ถูกต้อง" / "Invalid email format"
"validation.passwordTooShort" // "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" / "Password must be at least 8 characters"

// Products
"product.notFound"       // "ไม่พบสินค้า" / "Product not found"
"product.createSuccess"  // "เพิ่มสินค้าสำเร็จ" / "Product created successfully"

// Cart
"cart.addSuccess"        // "เพิ่มสินค้าลงตะกร้าแล้ว" / "Item added to cart"
"cart.empty"             // "ตะกร้าสินค้าว่างเปล่า" / "Your cart is empty"
```

---

## 🔧 Adding New Messages

### Step 1: Add to Message Dictionary

Edit [src/config/i18n/messages.ts](../../src/config/i18n/messages.ts):

```typescript
export const messages = {
  en: {
    // ... existing messages
    "myFeature.success": "Operation completed successfully",
    "myFeature.error": "Operation failed",
  },

  th: {
    // ... existing messages
    "myFeature.success": "ดำเนินการสำเร็จ",
    "myFeature.error": "ดำเนินการล้มเหลว",
  },
} as const;
```

### Step 2: Update Message Categories (Optional)

```typescript
export const MessageCategories = {
  // ... existing categories
  myFeature: [
    "myFeature.success",
    "myFeature.error",
  ],
} as const;
```

### Step 3: Use in Your Code

```typescript
// Server-side
import { getMessage } from "@/lib/utils/i18n";
const message = getMessage("myFeature.success", "th");

// Client-side
const { t } = useTranslation();
const message = t("myFeature.success");
```

**TypeScript will auto-complete and validate your message keys!** ✨

---

## 🌍 Language Detection

### Priority Order

1. **Client-side (Browser):**
   - localStorage (`preferred-language`)
   - Browser language (`navigator.language`)
   - Default: Thai

2. **Server-side (API):**
   - `Accept-Language` header
   - Default: Thai

### How It Works

```typescript
// Client-side auto-detection
const { language } = useTranslation();
// Automatically detects on mount

// Server-side auto-detection
const lang = getLanguageFromRequest(request.headers);
// Parses Accept-Language header
```

### Manual Override

```typescript
// Client-side
const { setLanguage } = useTranslation();
setLanguage("en"); // Switches to English

// Server-side
const message = getMessage("auth.required", "en"); // Force English
```

---

## 🎯 Best Practices

### 1. Always Use Message Keys

**❌ Bad (Hardcoded):**
```typescript
return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
```

**✅ Good (i18n):**
```typescript
return errorResponseWithLang("product.notFound", request.headers, 404);
```

### 2. Use Auto-Detection Functions

**❌ Bad (Manual language detection):**
```typescript
const acceptLang = request.headers.get("accept-language");
const lang = acceptLang?.includes("en") ? "en" : "th";
const message = getMessage("error.unexpected", lang);
```

**✅ Good (Auto-detection):**
```typescript
return errorResponseWithLang("error.unexpected", request.headers);
```

### 3. Consistent Message Keys

Use the pattern: `category.action` or `category.state`

**✅ Good:**
- `product.createSuccess`
- `product.notFound`
- `auth.unauthorized`
- `validation.emailInvalid`

**❌ Bad:**
- `successProductCreate`
- `productNotFoundError`
- `noAuth`

### 4. Provide Context in Errors

**❌ Bad (Generic):**
```typescript
toast.error(t("error.unexpected"));
```

**✅ Good (Specific):**
```typescript
toast.error(t("product.createError"));
```

### 5. Use String Interpolation

**❌ Bad (Concatenation):**
```typescript
const message = t("upload.error") + " " + `Max size: ${maxSize}MB`;
```

**✅ Good (Interpolation):**
```typescript
const message = t("upload.tooLarge", { size: maxSize.toString() });
```

---

## 📊 Migration Guide

### Migrating Existing Code

#### Before (Mixed Thai/English):

```typescript
// Old code with hardcoded messages
export async function POST(request: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: "ไม่พบอีเมลนี้ในระบบ" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, message: "User registered successfully!" },
    { status: 201 }
  );
}
```

#### After (i18n):

```typescript
// New code with i18n support
import { errorResponseWithLang, successResponseWithLang } from "@/lib/utils/api-response";

export async function POST(request: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return errorResponseWithLang(
      "auth.emailNotFound",
      request.headers,
      404
    );
  }

  return successResponseWithLang(
    user,
    "register.success",
    request.headers,
    201
  );
}
```

### Migration Checklist

- [ ] Identify all hardcoded error messages
- [ ] Find corresponding message key or create new one
- [ ] Replace with i18n function (`getMessage`, `t`, etc.)
- [ ] Test with both Thai and English
- [ ] Update tests to use message keys

---

## 🧪 Testing

### Testing Server-side i18n

```typescript
import { getMessage } from "@/lib/utils/i18n";

describe("i18n messages", () => {
  it("should return Thai message", () => {
    const message = getMessage("auth.required", "th");
    expect(message).toBe("กรุณาเข้าสู่ระบบ");
  });

  it("should return English message", () => {
    const message = getMessage("auth.required", "en");
    expect(message).toBe("Authentication required");
  });

  it("should interpolate parameters", () => {
    const message = getMessage("upload.tooLarge", "en", { size: "5" });
    expect(message).toContain("5MB");
  });
});
```

### Testing Client-side i18n

```typescript
import { renderHook, act } from "@testing-library/react";
import { useTranslation } from "@/hooks/useTranslation";

describe("useTranslation", () => {
  it("should translate messages", () => {
    const { result } = renderHook(() => useTranslation());

    const message = result.current.t("auth.required");
    expect(message).toBeTruthy();
  });

  it("should change language", () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.language).toBe("en");
  });
});
```

---

## 🚀 Future Enhancements

### Potential Improvements

1. **More Languages**
   - Add Japanese, Chinese, etc.
   - Easy to extend the `messages` object

2. **Dynamic Loading**
   - Load translations on-demand
   - Reduce initial bundle size

3. **Translation Management**
   - External CMS for translations
   - Non-technical staff can update messages

4. **Pluralization**
   - Handle singular/plural forms
   - "1 item" vs "2 items"

5. **Date/Number Formatting**
   - Locale-aware formatting
   - Thai: "1,234.56 บาท"
   - English: "$1,234.56"

6. **RTL Support**
   - Add Arabic, Hebrew support
   - Right-to-left layout

---

## 📚 Related Documentation

- [API Response Standards](./API_RESPONSE_STANDARDS.md) - Issue #77
- [Validation Error Handling](./VALIDATION_ERROR.md)
- [N+1 Query Prevention](./N+1_QUERY_PREVENTION.md) - Issue #74

---

## 🎯 Quick Reference

### Most Common Functions

```typescript
// Server-side
import { getMessage, getLanguageFromRequest } from "@/lib/utils/i18n";
import { errorResponseWithLang, successResponseWithLang } from "@/lib/utils/api-response";

// Client-side
import { useTranslation } from "@/hooks/useTranslation";
const { t, language, setLanguage } = useTranslation();
```

### Most Common Message Keys

```typescript
// Auth
"auth.required"
"auth.unauthorized"
"auth.forbidden"

// Validation
"validation.failed"
"validation.emailInvalid"
"validation.passwordTooShort"

// Success
"success.changesSaved"
"success.operationComplete"

// Errors
"error.unexpected"
"error.notFound"
"error.serverError"
```

---

**Implementation Complete:** ✅
**Status:** Production Ready
**Issue:** #71 - Inconsistent Error Messages
**Last Updated:** 2025-01-05
