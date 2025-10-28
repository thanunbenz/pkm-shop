# 🛡️ Zod Validation Implementation

เอกสารการใช้งาน Zod Validation ทั้งโปรเจกต์

---

## 📋 สารบัญ
- [การติดตั้ง](#-การติดตั้ง)
- [Validation Schemas](#-validation-schemas)
- [การใช้งานใน API Routes](#-การใช้งานใน-api-routes)
- [Error Handling](#-error-handling)
- [ตัวอย่างการใช้งาน](#-ตัวอย่างการใช้งาน)
- [Best Practices](#-best-practices)

---

## 🚀 การติดตั้ง

### 1. ติดตั้ง Zod

```bash
# แก้ไข permission ก่อน (ถ้าจำเป็น)
sudo chown -R $(whoami) /Users/sumbenz/Desktop/pkm-shop/node_modules

# ติดตั้ง Zod
npm install zod
```

### 2. ตรวจสอบการติดตั้ง

```bash
# ดูใน package.json
grep "zod" package.json

# ควรเห็น:
# "zod": "^3.x.x"
```

---

## 📦 Validation Schemas

เราได้สร้าง schemas ไว้ที่ `src/lib/validations/`

### โครงสร้างไฟล์

```
src/lib/validations/
├── index.ts          # Export ทั้งหมด
├── user.ts           # User validation
├── product.ts        # Product validation
├── upload.ts         # File upload validation
└── common.ts         # Common validation helpers
```

---

## 👤 User Validation

**ไฟล์:** `src/lib/validations/user.ts`

### 1. Register Schema

```typescript
import { registerSchema } from "@/lib/validations";

// Validates:
registerSchema.parse({
  fname: "สมชาย",                    // ✅ 2-50 ตัวอักษร
  lname: "ใจดี",                      // ✅ 2-50 ตัวอักษร
  email: "somchai@example.com",      // ✅ Email format
  password: "Password123",            // ✅ 8+ chars, มี A-Z a-z 0-9
  confirmPassword: "Password123"     // ✅ ตรงกับ password
});
```

**Validation Rules:**
- `fname`: 2-50 chars, ตัวอักษรเท่านั้น
- `lname`: 2-50 chars, ตัวอักษรเท่านั้น
- `email`: Email format, lowercase, trim
- `password`: 8-100 chars, ต้องมี A-Z a-z 0-9
- `confirmPassword`: ต้องตรงกับ password

### 2. Login Schema

```typescript
import { loginSchema } from "@/lib/validations";

loginSchema.parse({
  email: "somchai@example.com",
  password: "Password123"
});
```

### 3. Update Profile Schema

```typescript
import { updateProfileSchema } from "@/lib/validations";

updateProfileSchema.parse({
  fname: "สมชาย",
  lname: "ใจดี",
  email: "newemail@example.com"
});
```

### 4. Change Password Schema

```typescript
import { changePasswordSchema } from "@/lib/validations";

changePasswordSchema.parse({
  currentPassword: "OldPassword123",
  newPassword: "NewPassword456",
  confirmNewPassword: "NewPassword456"
});
```

---

## 📦 Product Validation

**ไฟล์:** `src/lib/validations/product.ts`

### 1. Product Schema

```typescript
import { productSchema } from "@/lib/validations";

productSchema.parse({
  name: "Pokémon Booster Pack",          // ✅ 3-200 chars
  description: "ซองการ์ดโปเกมอน...",      // ✅ 10-2000 chars
  price: 150,                             // ✅ > 0, ≤ 1,000,000
  discountprice: 120,                     // ✅ ≥ 0, ≤ price
  category: "ซอง",                        // ✅ 2-50 chars
  issale: true,                           // ✅ boolean
  isrecommend: false,                     // ✅ boolean
  image: "/uploads/product.jpg"           // ✅ optional
});
```

**Validation Rules:**
- `name`: 3-200 chars
- `description`: 10-2000 chars
- `price`: positive, ≤ 1,000,000
- `discountprice`: non-negative, ≤ price
- `category`: 2-50 chars
- `issale`: boolean
- `isrecommend`: boolean
- `image`: optional string

### 2. Create Product Schema (FormData)

```typescript
import { createProductSchema } from "@/lib/validations";

// สำหรับ FormData
createProductSchema.parse({
  name: "Pokémon Booster Pack",
  description: "ซองการ์ดโปเกมอน",
  price: "150",                  // ✅ String → Number
  discountprice: "120",          // ✅ String → Number
  category: "ซอง",
  issale: "true",                // ✅ String → Boolean
  isrecommend: "false"           // ✅ String → Boolean
});
```

### 3. Product Query Schema

```typescript
import { productQuerySchema } from "@/lib/validations";

// สำหรับ query parameters
productQuerySchema.parse({
  page: "1",                    // ✅ String → Number
  limit: "10",                  // ✅ 1-100
  category: "ซอง",
  issale: "true",               // ✅ String → Boolean
  search: "pokemon",
  sortBy: "price",              // ✅ name|price|createdAt|discountprice
  order: "desc"                 // ✅ asc|desc
});
```

---

## 📤 Upload Validation

**ไฟล์:** `src/lib/validations/upload.ts`

### File Upload Schema

```typescript
import { fileUploadSchema } from "@/lib/validations";

// Browser File object
const file = document.querySelector('input[type="file"]').files[0];

fileUploadSchema.parse({ file });
```

**Validation Rules:**
- Max file size: 5MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

---

## 🔧 Common Validation

**ไฟล์:** `src/lib/validations/common.ts`

### Helpers พร้อมใช้งาน

```typescript
// ID validation
idSchema.parse({ id: "123" });

// Pagination
paginationSchema.parse({ page: 1, limit: 10 });

// Search
searchSchema.parse({ query: "pokemon" });

// Sort
sortSchema.parse({ sortBy: "createdAt", order: "desc" });

// Date range
dateRangeSchema.parse({
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-01-31")
});

// Email
emailSchema.parse({ email: "test@example.com" });

// Thai phone
phoneSchema.parse({ phone: "0812345678" });

// Thai ID card
thaiIdSchema.parse({ idCard: "1234567890123" });

// URL
urlSchema.parse({ url: "https://example.com" });

// Slug
slugSchema.parse({ slug: "my-product-slug" });

// Color (Hex)
colorSchema.parse({ color: "#FF5733" });
```

---

## 🚀 การใช้งานใน API Routes

### ตัวอย่าง: Register API

**`src/app/api/v1/register/route.ts`**

```typescript
import { registerSchema } from "@/lib/validations";
import { validationErrorResponse } from "@/lib/utils/validation-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ Validate with Zod
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    // ✅ ข้อมูลผ่าน validation แล้ว พร้อม type-safe
    const { fname, lname, email, password } = validationResult.data;

    // ... business logic
  } catch (error) {
    // error handling
  }
}
```

### ตัวอย่าง: Products API

**`src/app/api/v1/products/route.ts`**

```typescript
import { productQuerySchema } from "@/lib/validations";
import { validationErrorResponse } from "@/lib/utils/validation-error";

export async function GET(request: NextRequest) {
  try {
    // ✅ Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    const validationResult = productQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    const { page, limit, category, search, sortBy, order } = validationResult.data;

    // ✅ Build query with validated data
    const products = await prisma.product.findMany({
      where: { category, /* ... */ },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages }
    });
  } catch (error) {
    // error handling
  }
}
```

---

## 🚨 Error Handling

### Validation Error Helper

**`src/lib/utils/validation-error.ts`**

```typescript
import { validationErrorResponse, isZodError } from "@/lib/utils/validation-error";

// ✅ Automatic error response
const validationResult = schema.safeParse(data);
if (!validationResult.success) {
  return validationErrorResponse(validationResult.error);
}

// ✅ Check if error is Zod error
if (isZodError(error)) {
  return validationErrorResponse(error);
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["รูปแบบอีเมลไม่ถูกต้อง"],
    "password": [
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
      "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
    ]
  }
}
```

### การใช้งาน Error ใน Client

```typescript
// Client-side handling
try {
  const response = await fetch("/api/v1/register", {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!result.success) {
    // ✅ แสดง errors ใน form
    Object.keys(result.errors).forEach(field => {
      const errors = result.errors[field];
      showError(field, errors[0]); // แสดง error แรก
    });
  }
} catch (error) {
  console.error(error);
}
```

---

## 💡 ตัวอย่างการใช้งาน

### 1. API Route with Validation

```typescript
// src/app/api/v1/products/route.ts
import { productSchema } from "@/lib/validations";
import { validationErrorResponse, isZodError } from "@/lib/utils/validation-error";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ✅ Validate
    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    const productData = validationResult.data;

    // ✅ Create product
    const product = await prisma.product.create({
      data: productData
    });

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });

  } catch (error) {
    if (isZodError(error)) {
      return validationErrorResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### 2. Form Validation (Client-side)

```typescript
// Client component
"use client";

import { registerSchema } from "@/lib/validations";
import { extractFormErrors } from "@/lib/utils/validation-error";

export default function RegisterForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      fname: e.target.fname.value,
      lname: e.target.lname.value,
      email: e.target.email.value,
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
    };

    // ✅ Validate บน client ก่อน
    try {
      registerSchema.parse(formData);
      setErrors({});

      // ส่งไป server
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        // แสดง server errors
        setErrors(result.errors || {});
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // แสดง client-side errors
        setErrors(extractFormErrors(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="fname" />
      {errors.fname && <span className="error">{errors.fname}</span>}

      <input name="lname" />
      {errors.lname && <span className="error">{errors.lname}</span>}

      {/* ... */}
    </form>
  );
}
```

---

## ✅ Best Practices

### 1. Always Use safeParse

```typescript
// ✅ Good - won't throw
const result = schema.safeParse(data);
if (!result.success) {
  return validationErrorResponse(result.error);
}

// ❌ Bad - throws error
const data = schema.parse(unknownData); // can crash!
```

### 2. Validate Early

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ✅ Validate ก่อนทำอะไร
  const validationResult = schema.safeParse(body);
  if (!validationResult.success) {
    return validationErrorResponse(validationResult.error);
  }

  // ✅ ตรงนี้ data ปลอดภัยแล้ว
  const validData = validationResult.data;

  // ... rest of logic
}
```

### 3. Type-safe Responses

```typescript
// ✅ Use inferred types
type RegisterInput = z.infer<typeof registerSchema>;

function processRegistration(data: RegisterInput) {
  // TypeScript รู้ structure ของ data
  console.log(data.email); // ✅ Type-safe
  console.log(data.xyz);   // ❌ Error: Property doesn't exist
}
```

### 4. Reuse Schemas

```typescript
// ✅ สร้าง base schema
const baseProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
});

// ✅ Extend สำหรับ create
const createProductSchema = baseProductSchema.extend({
  category: z.string().min(2),
});

// ✅ Partial สำหรับ update
const updateProductSchema = baseProductSchema.partial();
```

### 5. Custom Error Messages

```typescript
const schema = z.object({
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")          // ✅ Custom message
    .toLowerCase()
    .trim(),

  age: z
    .number()
    .min(18, "อายุต้องมากกว่า 18 ปี")        // ✅ Custom message
    .max(100, "อายุต้องไม่เกิน 100 ปี"),
});
```

### 6. Complex Validation

```typescript
// ✅ Cross-field validation
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"], // ระบุ field ที่ error
});

// ✅ Conditional validation
const schema = z.object({
  type: z.enum(["email", "phone"]),
  contact: z.string(),
}).refine((data) => {
  if (data.type === "email") {
    return z.string().email().safeParse(data.contact).success;
  }
  return z.string().regex(/^0[0-9]{9}$/).safeParse(data.contact).success;
}, {
  message: "รูปแบบติดต่อไม่ถูกต้อง",
  path: ["contact"],
});
```

---

## 📊 Schema Coverage

### ✅ Implemented

- [x] User registration
- [x] User login
- [x] User profile update
- [x] Password change
- [x] Product CRUD
- [x] Product query/filter
- [x] File upload
- [x] Common helpers (ID, pagination, search, sort, etc.)

### 📋 TODO (Optional)

- [ ] Order validation
- [ ] Payment validation
- [ ] Cart validation
- [ ] Review/Rating validation
- [ ] Category validation

---

## 🔗 เอกสารเพิ่มเติม

### Zod Documentation
- **Official Docs:** https://zod.dev
- **GitHub:** https://github.com/colinhacks/zod
- **TypeScript:** https://www.typescriptlang.org/docs/

### Project Documentation
- **Performance:** [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)
- **Security:** [../02-security/README.md](../02-security/README.md)
- **Setup:** [../00-getting-started/SETUP_GUIDE.md](../00-getting-started/SETUP_GUIDE.md)

---

## ⚡ Quick Reference

```typescript
// Import
import { registerSchema, productSchema, fileUploadSchema } from "@/lib/validations";
import { validationErrorResponse, isZodError } from "@/lib/utils/validation-error";

// Validate
const result = schema.safeParse(data);
if (!result.success) {
  return validationErrorResponse(result.error);
}

// Use validated data
const validData = result.data; // Type-safe!

// Error handling
catch (error) {
  if (isZodError(error)) {
    return validationErrorResponse(error);
  }
}
```

---

**Created:** 2025-10-28
**Status:** ✅ Ready to Use
**Next Steps:** Install Zod และเริ่มใช้งาน!

**⚠️ หมายเหตุ:** อย่าลืมรัน `npm install zod` ก่อนใช้งาน!
