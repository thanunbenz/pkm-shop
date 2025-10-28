# 🔧 NextAuth CLIENT_FETCH_ERROR - Fix Documentation

การแก้ไข NextAuth error "The string did not match the expected pattern"

---

## 🐛 Error Message

```
[next-auth][error][CLIENT_FETCH_ERROR]
https://next-auth.js.org/errors#client_fetch_error
"The string did not match the expected pattern."
```

---

## 🔍 สาเหตุ

### ปัญหาหลัก: Configuration Conflict

**ใน `src/app/api/v1/auth/authOptions.ts` มีความขัดแย้ง:**

```typescript
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),  // ❌ ใช้ database adapter
    providers: [
        CredentialsProvider({ ... }),  // ❌ ใช้ Credentials provider
    ],
    session: {
        strategy: "jwt",  // ❌ กำหนดเป็น JWT
    },
}
```

### ทำไมถึงขัดแย้ง?

1. **PrismaAdapter**
   - ต้องการ `strategy: "database"`
   - เก็บ session ใน database
   - ใช้กับ OAuth providers (Google, Facebook)

2. **CredentialsProvider**
   - รองรับเฉพาะ `strategy: "jwt"`
   - ไม่สามารถใช้ database adapter
   - ใช้สำหรับ email/password login

3. **ผลลัพธ์**
   - NextAuth พยายามใช้ database session แต่ CredentialsProvider บังคับให้ใช้ JWT
   - เกิด pattern mismatch
   - Authentication ไม่ทำงาน

---

## ✅ วิธีแก้ไข

### Option 1: ใช้ JWT อย่างเดียว (แนะนำ) ✅

**เหมาะสำหรับ:** โปรเจกต์ที่ใช้ email/password login เป็นหลัก

**การแก้ไข:**

```typescript
// src/app/api/v1/auth/authOptions.ts
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import prisma from "@/lib/db";

// ❌ ลบ PrismaAdapter import
// import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOptions: NextAuthOptions = {
    // ❌ ลบ adapter ออก
    // adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // ... existing logic
            },
        }),
    ],
    session: {
        strategy: "jwt",  // ✅ ใช้ JWT
        maxAge: 24 * 60 * 60,
    },
    // ... rest of config
}
```

**ผลลัพธ์:**
- ✅ ใช้ JWT sessions (stateless)
- ✅ ไม่ต้องเก็บ session ใน database
- ✅ Performance ดีกว่า (ไม่ต้อง query database)
- ✅ เหมาะกับ CredentialsProvider

---

### Option 2: ใช้ Database Sessions (สำหรับ OAuth)

**เหมาะสำหรับ:** โปรเจกต์ที่ต้องการใช้ OAuth providers (Google, Facebook)

**หมายเหตุ:** ไม่สามารถใช้พร้อมกับ CredentialsProvider

```typescript
// ถ้าต้องการใช้ OAuth เท่านั้น
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),  // ✅ ใช้ adapter
    providers: [
        // ❌ ลบ CredentialsProvider ออก
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "database",  // ✅ เปลี่ยนเป็น database
        maxAge: 30 * 24 * 60 * 60,
    },
    // ... rest of config
}
```

**ข้อจำกัด:**
- ❌ ไม่สามารถใช้ email/password login
- ✅ รองรับ OAuth providers เท่านั้น
- ⚠️ ต้องเก็บ session ใน database (ใช้ disk space มากขึ้น)

---

### Option 3: ใช้ทั้ง JWT และ Database (Advanced)

**เหมาะสำหรับ:** โปรเจกต์ที่ต้องการทั้ง Credentials และ OAuth

**วิธีทำ:** ใช้ 2 NextAuth instances แยกกัน

```typescript
// authOptions-credentials.ts (สำหรับ email/password)
export const credentialsAuthOptions: NextAuthOptions = {
    providers: [CredentialsProvider({ ... })],
    session: { strategy: "jwt" },
}

// authOptions-oauth.ts (สำหรับ OAuth)
export const oauthAuthOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [GoogleProvider({ ... }), FacebookProvider({ ... })],
    session: { strategy: "database" },
}

// route.ts - เลือกใช้ตาม provider
```

**ข้อจำกัด:**
- 🔴 ซับซ้อนมาก
- 🔴 ต้องจัดการ 2 auth routes
- 🔴 ไม่แนะนำสำหรับโปรเจกต์ส่วนใหญ่

---

## 🎯 สำหรับโปรเจกต์นี้

**เลือก Option 1** เพราะ:
- ✅ ใช้ CredentialsProvider เป็นหลัก
- ✅ ไม่มี OAuth setup (GOOGLE/FACEBOOK env empty)
- ✅ JWT เหมาะกับ use case นี้
- ✅ Performance ดีกว่า

---

## 📋 สิ่งที่แก้ไขแล้ว

### ไฟล์ที่แก้: `src/app/api/v1/auth/authOptions.ts`

```diff
  import { compare } from "bcryptjs";
  import CredentialsProvider from "next-auth/providers/credentials";
- import { PrismaAdapter } from '@next-auth/prisma-adapter';
  import type { NextAuthOptions, User } from "next-auth";
  import prisma from "@/lib/db";

  export const authOptions: NextAuthOptions = {
-     adapter: PrismaAdapter(prisma),
      providers: [
          CredentialsProvider({ ... }),
      ],
      session: {
          strategy: "jwt",
          maxAge: 24 * 60 * 60,
      },
      // ... rest of config
  }
```

---

## 🧪 การทดสอบ

### 1. ทดสอบ Development Server

```bash
# Start server
npm run dev

# ควรเห็น:
✓ Ready in 1712ms
# ไม่มี NextAuth errors
```

### 2. ทดสอบ Login

```bash
# 1. ไปที่ http://localhost:3000/login
# 2. ใส่ email/password
# 3. Login ควรสำเร็จ
```

### 3. ตรวจสอบ Console

```javascript
// Browser console ไม่ควรมี:
[next-auth][error][CLIENT_FETCH_ERROR]

// ควรเห็น:
[next-auth][debug] Using JWT session
```

---

## 🔒 Security Notes

### JWT Sessions (ที่เราใช้)

**ข้อดี:**
- ✅ Stateless (ไม่ต้องเก็บใน database)
- ✅ Performance ดี (ไม่ต้อง query)
- ✅ Scale ง่าย (ไม่มี session table)

**ข้อควรระวัง:**
- ⚠️ ไม่สามารถ revoke token ก่อนหมดอายุ
- ⚠️ Token size ใหญ่กว่า session ID
- ⚠️ ต้องระวังเรื่อง XSS (NextAuth จัดการให้แล้ว)

**Best Practices:**
```typescript
session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,  // 1 day (สั้นกว่า = ปลอดภัยกว่า)
},
secret: process.env.NEXTAUTH_SECRET,  // ต้องเป็น strong secret
```

### ตรวจสอบ NEXTAUTH_SECRET

```bash
# .env
NEXTAUTH_SECRET="6MJxdDyeYeBvX803ByG2dzyMVoMo3b/B9J25DPMl4On5QvMj5D2CqrejsqY="

# ใน production ควรใช้ secret ที่แข็งแรง:
# openssl rand -base64 32
```

---

## 📚 เอกสารอ้างอิง

### NextAuth Errors

- **CLIENT_FETCH_ERROR:** https://next-auth.js.org/errors#client_fetch_error
  - เกิดจาก configuration mismatch
  - มักเกิดจาก adapter + credentials conflict

### NextAuth Configuration

- **Providers:** https://next-auth.js.org/configuration/providers
  - CredentialsProvider: JWT only
  - OAuth providers: สามารถใช้ทั้ง JWT และ database

- **Session Strategies:** https://next-auth.js.org/configuration/options#session
  - `jwt`: Stateless, ไม่เก็บ database
  - `database`: Stateful, เก็บใน database

- **Adapters:** https://next-auth.js.org/adapters
  - ใช้กับ OAuth providers
  - ไม่ใช้กับ CredentialsProvider

---

## 🎓 สิ่งที่ได้เรียนรู้

### 1. CredentialsProvider Limitations

```typescript
// ❌ ไม่สามารถทำได้
CredentialsProvider + PrismaAdapter

// ✅ ใช้ได้
CredentialsProvider + JWT sessions
```

### 2. Session Strategy Rules

| Provider Type | Supported Strategy | Adapter Required? |
|---------------|-------------------|-------------------|
| CredentialsProvider | JWT only | ❌ No |
| OAuth (Google, FB) | JWT or Database | ✅ Yes (for database) |
| Email | Database only | ✅ Yes |

### 3. ข้อควรระวัง

- ⚠️ อย่าใช้ adapter กับ CredentialsProvider
- ⚠️ ตรวจสอบ session strategy ให้ตรงกับ provider
- ⚠️ อ่าน documentation ก่อนใช้ adapter

---

## ✅ Checklist

- [x] ลบ `adapter: PrismaAdapter(prisma)` ออก
- [x] ยืนยันว่า `strategy: "jwt"`
- [x] ตรวจสอบ NEXTAUTH_SECRET มีค่า
- [x] ทดสอบ login/logout
- [ ] ทดสอบใน production

---

## 🚀 Next Steps

### ถ้าต้องการเพิ่ม OAuth ในอนาคต

1. **เพิ่ม Prisma models:**
```prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

2. **แยก auth strategies:**
   - `/api/auth/[...nextauth]` - สำหรับ credentials (JWT)
   - `/api/oauth/[...nextauth]` - สำหรับ OAuth (database)

3. **อัพเดต UI:**
   - แสดงปุ่ม "Login with Google/Facebook"
   - เชื่อมกับ OAuth endpoint

---

**สร้างเมื่อ:** 2025-10-28
**แก้ไขโดย:** Claude Code
**Status:** ✅ Fixed & Tested
