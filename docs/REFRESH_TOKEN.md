# Refresh Token System Documentation

## ภาพรวม

ระบบ Refresh Token ถูกพัฒนาขึ้นเพื่อเพิ่มความปลอดภัยและประสบการณ์ผู้ใช้ที่ดีขึ้นในระบบ Authentication โดยใช้ JWT (JSON Web Tokens) ร่วมกับ Refresh Tokens

### หลักการทำงาน

1. เมื่อผู้ใช้ Login สำเร็จ ระบบจะสร้าง:
   - **Access Token** (JWT): ใช้สำหรับการเข้าถึง API, มีอายุ 24 ชั่วโมง
   - **Refresh Token**: ใช้สำหรับขอ Access Token ใหม่, มีอายุ 30 วัน

2. เมื่อ Access Token หมดอายุ:
   - Client ส่ง Refresh Token ไปที่ `/api/auth/refresh`
   - ระบบตรวจสอบความถูกต้องและสร้าง Access Token ใหม่
   - Refresh Token เก่าจะถูกลบและสร้างใหม่ (Token Rotation)

3. ข้อดี:
   - ลด Session ที่ Active นานเกินไป
   - เพิ่มความปลอดภัยด้วย Token Rotation
   - ผู้ใช้ไม่ต้อง Login บ่อย

---

## โครงสร้างฐานข้อมูล

### RefreshToken Model

```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique @db.VarChar(500)
  userId    Int
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### ฟิลด์ที่สำคัญ

- `token`: Refresh token string ที่เป็น unique (ความยาว 128 ตัวอักษร)
- `userId`: ID ของผู้ใช้ที่เป็นเจ้าของ token
- `expiresAt`: วันที่ token หมดอายุ (30 วันจากวันสร้าง)
- `user`: Relation ไปยัง User model

---

## ไฟล์ที่เกี่ยวข้อง

### 1. Utility Functions
**ไฟล์**: `src/lib/utils/refresh-token.ts`

#### ฟังก์ชันหลัก:

##### `createRefreshToken(userId: number)`
สร้าง refresh token ใหม่สำหรับผู้ใช้

```typescript
const refreshToken = await createRefreshToken(userId);
// Returns: { id, token, userId, expiresAt, user: {...} }
```

##### `validateRefreshToken(token: string)`
ตรวจสอบความถูกต้องของ refresh token

```typescript
const refreshToken = await validateRefreshToken(token);
// Returns: RefreshToken object หรือ null ถ้า invalid/expired
```

##### `rotateRefreshToken(oldToken: string)`
ลบ token เก่าและสร้าง token ใหม่

```typescript
const newRefreshToken = await rotateRefreshToken(oldToken);
// Returns: New RefreshToken object หรือ null ถ้า oldToken invalid
```

##### `revokeRefreshToken(token: string)`
ลบ refresh token

```typescript
const success = await revokeRefreshToken(token);
// Returns: true หรือ false
```

##### `revokeAllUserRefreshTokens(userId: number)`
ลบ refresh token ทั้งหมดของผู้ใช้

```typescript
const count = await revokeAllUserRefreshTokens(userId);
// Returns: จำนวน token ที่ถูกลบ
```

##### `cleanupExpiredTokens()`
ลบ refresh token ที่หมดอายุแล้วทั้งหมด

```typescript
const count = await cleanupExpiredTokens();
// Returns: จำนวน token ที่ถูกลบ
```

---

### 2. Auth Configuration
**ไฟล์**: `src/app/api/auth/[...nextauth]/authOptions.ts`

#### การปรับแต่ง

เพิ่ม `signIn` callback เพื่อสร้าง refresh token เมื่อผู้ใช้ login:

```typescript
callbacks: {
  async signIn({ user }) {
    if (user?.id) {
      await createRefreshToken(Number(user.id));
    }
    return true;
  },
  // ... other callbacks
}
```

---

### 3. Refresh API Endpoint
**ไฟล์**: `src/app/api/auth/refresh/route.ts`

#### API Specification

**Endpoint**: `POST /api/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**Success Response** (200):
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-refresh-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fname": "John",
    "lname": "Doe",
    "role": "USER"
  }
}
```

**Error Responses**:

- **400 Bad Request**: ไม่ได้ส่ง refresh token มา
```json
{
  "error": "Refresh token is required"
}
```

- **401 Unauthorized**: Refresh token ไม่ถูกต้องหรือหมดอายุ
```json
{
  "error": "Invalid or expired refresh token"
}
```

- **500 Internal Server Error**: เกิด error ในระบบ
```json
{
  "error": "Internal server error"
}
```

---

## วิธีการใช้งาน

### 1. Login และรับ Refresh Token

เมื่อผู้ใช้ login สำเร็จผ่าน NextAuth:

```typescript
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
});

if (result?.ok) {
  // Login สำเร็จ - Refresh token ถูกสร้างอัตโนมัติในฐานข้อมูล
  // ต้องดึง refresh token จาก database เอง
}
```

### 2. ขอ Access Token ใหม่

เมื่อ Access Token หมดอายุ:

```typescript
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    // ใช้ accessToken ใหม่
    const { accessToken, refreshToken: newRefreshToken, user } = data;

    // บันทึก tokens ใหม่
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Redirect to login
    window.location.href = "/login";
  }
}
```

### 3. Logout และลบ Refresh Token

```typescript
async function logout(refreshToken: string) {
  // เรียก API เพื่อลบ refresh token
  // หมายเหตุ: ต้องสร้าง endpoint นี้เอง
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  // หรือใช้ utility function โดยตรง
  import { revokeRefreshToken } from "@/lib/utils/refresh-token";
  await revokeRefreshToken(refreshToken);

  // ลบ tokens จาก storage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Redirect to login
  window.location.href = "/login";
}
```

---

## Best Practices

### 1. การจัดเก็บ Tokens

#### ฝั่ง Client:
- **Access Token**: เก็บใน memory (React state) หรือ sessionStorage
- **Refresh Token**: เก็บใน HTTP-only cookie (แนะนำ) หรือ localStorage

#### ฝั่ง Server:
- **Refresh Token**: เก็บในฐานข้อมูล (MySQL ผ่าน Prisma)
- Hash ค่า token ก่อนเก็บ (optional, เพิ่มความปลอดภัย)

### 2. Security Considerations

- ใช้ HTTPS เสมอเมื่อส่ง tokens
- ตั้งค่า CORS อย่างเหมาะสม
- Implement rate limiting สำหรับ refresh endpoint
- ลบ refresh tokens ที่หมดอายุเป็นระยะ (ใช้ `cleanupExpiredTokens()`)
- ใช้ Token Rotation (ระบบทำอัตโนมัติแล้ว)

### 3. Error Handling

```typescript
async function apiCallWithTokenRefresh(url: string, options: RequestInit) {
  const accessToken = localStorage.getItem("accessToken");

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // ถ้า Access Token หมดอายุ (401)
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      // ลอง refresh token
      const refreshResult = await refreshAccessToken(refreshToken);

      if (refreshResult) {
        // ลองเรียก API อีกครั้งด้วย token ใหม่
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshResult.accessToken}`,
          },
        });
      }
    }
  }

  return response;
}
```

### 4. Cleanup Cron Job

แนะนำให้รัน cleanup expired tokens เป็นระยะ:

```typescript
// ตัวอย่าง: รันทุกวันเวลา 00:00
import { cleanupExpiredTokens } from "@/lib/utils/refresh-token";

// ใช้ cron job หรือ scheduled task
setInterval(async () => {
  const deletedCount = await cleanupExpiredTokens();
  console.log(`Cleaned up ${deletedCount} expired tokens`);
}, 24 * 60 * 60 * 1000); // ทุก 24 ชั่วโมง
```

---

## การทดสอบ

### 1. ทดสอบการสร้าง Refresh Token

```bash
# Login ผ่าน UI หรือ API
curl -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# ตรวจสอบในฐานข้อมูล
# SELECT * FROM RefreshToken WHERE userId = 1;
```

### 2. ทดสอบการ Refresh Token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

### 3. ทดสอบการลบ Refresh Token

```typescript
import { revokeRefreshToken } from "@/lib/utils/refresh-token";

const success = await revokeRefreshToken("token-to-revoke");
console.log("Revoked:", success);
```

---

## Troubleshooting

### ปัญหา: Refresh token หมดอายุเร็วเกินไป

**วิธีแก้**: ตรวจสอบค่า `REFRESH_TOKEN_EXPIRY` ใน `src/lib/utils/refresh-token.ts`

```typescript
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 วัน
```

### ปัญหา: Token ถูกสร้างซ้ำทุกครั้งที่ login

**วิธีแก้**: ปรับ `signIn` callback ให้ลบ token เก่าก่อน:

```typescript
async signIn({ user }) {
  if (user?.id) {
    // ลบ token เก่าทั้งหมดของ user ก่อน
    await revokeAllUserRefreshTokens(Number(user.id));
    // สร้าง token ใหม่
    await createRefreshToken(Number(user.id));
  }
  return true;
}
```

### ปัญหา: Database ไม่มี table RefreshToken

**วิธีแก้**: รัน migration

```bash
npx prisma migrate dev
npx prisma generate
```

---

## เวอร์ชัน

- **Version**: 1.0.0
- **Last Updated**: October 28, 2025
- **Author**: Claude Code
- **Dependencies**:
  - Next.js 15.1.4
  - NextAuth.js
  - Prisma ORM
  - MySQL
  - jsonwebtoken

---

## License

This documentation is part of the PKM Shop project.
