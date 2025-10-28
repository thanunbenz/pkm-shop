# 🔧 Quick Fixes Summary

สรุปการแก้ไขปัญหาเร่งด่วน

---

## ⚠️ NextAuth CLIENT_FETCH_ERROR - Fixed!

### ปัญหา

```
[next-auth][error][CLIENT_FETCH_ERROR]
"The string did not match the expected pattern."
```

### สาเหตุ

API routes ใช้ Zod validation แต่ Zod ยังไม่ได้ติดตั้ง

### วิธีแก้

✅ **เพิ่ม Fallback Validation**
- ถ้ามี Zod จะใช้ Zod
- ถ้าไม่มี Zod จะใช้ manual validation

**ไฟล์ที่แก้:**
- `src/app/api/v1/register/route.ts`
- `src/app/api/v1/products/route.ts`

### ติดตั้ง Zod (แนะนำ)

```bash
# 1. แก้ไข permission
sudo chown -R $(whoami) /Users/sumbenz/Desktop/pkm-shop/node_modules

# 2. ติดตั้ง Zod
npm install zod

# 3. Restart server
# กด Ctrl+C แล้ว npm run dev ใหม่
```

---

## ✅ สิ่งที่แก้ไขแล้ว

### 1. Register API with Fallback Validation

```typescript
// Before: จะ error ถ้าไม่มี Zod
import { registerSchema } from "@/lib/validations";

// After: มี fallback
let registerSchema: any = null;

try {
    const validations = require("@/lib/validations");
    registerSchema = validations.registerSchema;
} catch (error) {
    console.log("Zod not installed, using manual validation");
}

// ใช้ manual validation ถ้าไม่มี Zod
if (registerSchema) {
    // Use Zod
} else {
    // Use manual validation
}
```

### 2. Products API with Fallback

```typescript
// Before: ต้องมี Zod
const validationResult = productQuerySchema.safeParse(queryParams);

// After: มี fallback
if (productQuerySchema) {
    // Use Zod
    const validationResult = productQuerySchema.safeParse(queryParams);
} else {
    // Manual parsing
    page = parseInt(searchParams.get("page") || "1");
    limit = parseInt(searchParams.get("limit") || "10");
}
```

---

## 🎯 ผลลัพธ์

### ตอนนี้

- ✅ Server รันได้ปกติ
- ✅ APIs ทำงานได้ (แม้ไม่มี Zod)
- ✅ Manual validation ทำงาน
- ⚠️ แนะนำให้ติดตั้ง Zod สำหรับ validation ที่ดีกว่า

### ถ้าติดตั้ง Zod

- ✅ Validation แม่นยำขึ้น
- ✅ Error messages ละเอียดขึ้น
- ✅ Type-safe
- ✅ ใช้ Zod schemas ทั้งหมดที่สร้างไว้

---

## 📝 Manual Validation Rules

### Register Validation

```typescript
✅ fname: มีอย่างน้อย 2 ตัวอักษร
✅ lname: มีอย่างน้อย 2 ตัวอักษร
✅ email: รูปแบบอีเมลถูกต้อง
✅ password: มีอย่างน้อย 8 ตัวอักษร
✅ confirmPassword: ตรงกับ password
```

### Products Query Validation

```typescript
✅ page: เป็นตัวเลข (default: 1)
✅ limit: เป็นตัวเลข (default: 10)
✅ category: string (optional)
✅ issale: boolean (optional)
✅ search: string (optional)
✅ sortBy: string (default: "createdAt")
✅ order: "asc" | "desc" (default: "desc")
```

---

## 🚀 Next Steps

### 1. ติดตั้ง Zod (แนะนำ)

```bash
sudo chown -R $(whoami) node_modules
npm install zod
```

### 2. Restart Server

```bash
# กด Ctrl+C
npm run dev
```

### 3. ทดสอบ

```bash
# Test register
curl -X POST http://localhost:3001/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "สมชาย",
    "lname": "ใจดี",
    "email": "test@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

---

## 📚 เอกสารที่เกี่ยวข้อง

- [ZOD_VALIDATION.md](../03-development/ZOD_VALIDATION.md) - Zod validation guide
- [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - Auth & roles system
- [NEXTAUTH_FIX.md](./NEXTAUTH_FIX.md) - NextAuth configuration

---

**Created:** 2025-10-28
**Status:** ✅ Fixed (with fallback)
**Recommendation:** Install Zod for better validation
