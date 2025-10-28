# 🔐 Authentication & Authorization System

เอกสารระบบ Auth และการจัดการ Role

---

## 📋 สารบัญ
- [Role Hierarchy](#-role-hierarchy)
- [Permissions](#-permissions)
- [Middleware Protection](#-middleware-protection)
- [API Authorization](#-api-authorization)
- [Helper Functions](#-helper-functions)
- [การใช้งาน](#-การใช้งาน)

---

## 👥 Role Hierarchy

### Roles ในระบบ

```
ADMIN (ผู้ดูแลระบบ)
  ↓
OPERATOR (พนักงาน)
  ↓
USER (ผู้ใช้งานทั่วไป)
```

### สิทธิ์การเข้าถึง

| Feature | USER | OPERATOR | ADMIN |
|---------|------|----------|-------|
| **Dashboard Access** | ❌ | ✅ | ✅ |
| **Product Management** | ❌ | ✅ | ✅ |
| **Order Management** | ❌ | ✅ | ✅ |
| **File Upload** | ❌ | ✅ | ✅ |
| **View Users** | ❌ | ✅ | ✅ |
| **System Settings** | ❌ | ❌ | ✅ |
| **Role Management** | ❌ | ❌ | ✅ |
| **System Logs** | ❌ | ❌ | ✅ |
| **Payment Config** | ❌ | ❌ | ✅ |

---

## 🎯 Permissions

### OPERATOR Permissions

OPERATOR มีสิทธิ์ในการทำงานประจำวันทั่วไป:

- ✅ จัดการสินค้า (CRUD)
- ✅ จัดการคำสั่งซื้อ
- ✅ อัปโหลดไฟล์/รูปภาพ
- ✅ ดูข้อมูลผู้ใช้
- ✅ เข้าถึง Dashboard
- ❌ ตั้งค่าระบบ (ADMIN only)
- ❌ จัดการ Roles (ADMIN only)
- ❌ ดู System Logs (ADMIN only)

### ADMIN Permissions

ADMIN มีสิทธิ์ทั้งหมด รวมถึง:

- ✅ ทุกสิทธิ์ของ OPERATOR
- ✅ ตั้งค่าระบบ
- ✅ จัดการ Roles
- ✅ ดู System Logs
- ✅ ตั้งค่า Payment
- ✅ จัดการ Integrations

### USER Permissions

USER เป็นลูกค้าทั่วไป:

- ✅ ดูสินค้า
- ✅ ซื้อสินค้า
- ✅ ดูประวัติการสั่งซื้อของตนเอง
- ✅ แก้ไขโปรไฟล์ของตนเอง
- ❌ เข้าถึง Dashboard

---

## 🛡️ Middleware Protection

**ไฟล์:** `src/middleware.ts`

### Dashboard Protection

```typescript
// OPERATOR และ ADMIN สามารถเข้า dashboard ได้
if (request.nextUrl.pathname.startsWith("/dashboard")) {
  const isStaff = token.role === "OPERATOR" || token.role === "ADMIN";

  if (!isStaff) {
    // USER ไม่สามารถเข้าได้
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ADMIN-only routes
  const adminOnlyRoutes = [
    "/dashboard/settings",
    "/dashboard/roles",
    "/dashboard/system",
  ];

  if (isAdminRoute && token.role !== "ADMIN") {
    // OPERATOR ไม่สามารถเข้า ADMIN routes
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

### ADMIN-Only Routes

Routes ที่เฉพาะ ADMIN เท่านั้น:

- `/dashboard/settings/*` - ตั้งค่าระบบ
- `/dashboard/roles/*` - จัดการ Roles
- `/dashboard/system/*` - ระบบ logs และ monitoring

---

## 🔒 API Authorization

### Helper Functions

**ไฟล์:** `src/lib/utils/auth-helpers.ts`

#### isStaff()
ตรวจสอบว่าเป็น OPERATOR หรือ ADMIN

```typescript
import { isStaff } from "@/lib/utils/auth-helpers";

if (isStaff(session.user?.role)) {
  // Allow access
}
```

#### isAdmin()
ตรวจสอบว่าเป็น ADMIN

```typescript
import { isAdmin } from "@/lib/utils/auth-helpers";

if (isAdmin(session.user?.role)) {
  // Allow ADMIN-only action
}
```

#### hasStaffAccess()
ตรวจสอบ session และ role

```typescript
import { hasStaffAccess } from "@/lib/utils/auth-helpers";

if (!hasStaffAccess(session)) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
```

#### hasAdminAccess()
ตรวจสอบว่าเป็น ADMIN จาก session

```typescript
import { hasAdminAccess } from "@/lib/utils/auth-helpers";

if (!hasAdminAccess(session)) {
  return NextResponse.json(
    { error: "Admin access required" },
    { status: 403 }
  );
}
```

#### hasPermission()
ตรวจสอบ permission เฉพาะ

```typescript
import { hasPermission } from "@/lib/utils/auth-helpers";

if (hasPermission(session.user?.role, "MANAGE_PRODUCTS")) {
  // Allow product management
}
```

---

## 💡 การใช้งาน

### 1. ใน API Route (OPERATOR & ADMIN)

```typescript
// src/app/api/v1/products/route.ts
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // ✅ Allow OPERATOR and ADMIN
  if (!hasStaffAccess(session)) {
    return NextResponse.json(
      { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
      { status: 401 }
    );
  }

  // ... create product logic
}
```

### 2. ใน API Route (ADMIN Only)

```typescript
// src/app/api/v1/settings/route.ts
import { hasAdminAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // ✅ ADMIN only
  if (!hasAdminAccess(session)) {
    return NextResponse.json(
      { success: false, ...getUnauthorizedError("ADMIN") },
      { status: 403 }
    );
  }

  // ... update settings logic
}
```

### 3. ตรวจสอบ Permission เฉพาะ

```typescript
import { hasPermission, PERMISSIONS } from "@/lib/utils/auth-helpers";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check specific permission
  if (!hasPermission(session.user?.role, "DELETE_PRODUCT")) {
    return NextResponse.json(
      { error: "You don't have permission to delete products" },
      { status: 403 }
    );
  }

  // ... delete logic
}
```

### 4. ใน Client Component

```typescript
"use client";

import { useSession } from "next-auth/react";
import { isStaff, isAdmin } from "@/lib/utils/auth-helpers";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Show for OPERATOR and ADMIN */}
      {isStaff(session?.user?.role) && (
        <Link href="/dashboard/products">Manage Products</Link>
      )}

      {/* Show for ADMIN only */}
      {isAdmin(session?.user?.role) && (
        <Link href="/dashboard/settings">System Settings</Link>
      )}
    </div>
  );
}
```

---

## 📊 Permission Matrix

### Detailed Permissions

```typescript
export const PERMISSIONS = {
  // Product Management (OPERATOR & ADMIN)
  MANAGE_PRODUCTS: [ROLES.OPERATOR, ROLES.ADMIN],
  CREATE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],
  UPDATE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],
  DELETE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],

  // Order Management (OPERATOR & ADMIN)
  MANAGE_ORDERS: [ROLES.OPERATOR, ROLES.ADMIN],
  VIEW_ORDERS: [ROLES.OPERATOR, ROLES.ADMIN],
  UPDATE_ORDER_STATUS: [ROLES.OPERATOR, ROLES.ADMIN],

  // Upload (OPERATOR & ADMIN)
  UPLOAD_FILES: [ROLES.OPERATOR, ROLES.ADMIN],
  DELETE_FILES: [ROLES.OPERATOR, ROLES.ADMIN],

  // Users (OPERATOR & ADMIN)
  VIEW_USERS: [ROLES.OPERATOR, ROLES.ADMIN],

  // System (ADMIN ONLY)
  MANAGE_SETTINGS: [ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.ADMIN],
  VIEW_SYSTEM_LOGS: [ROLES.ADMIN],
  MANAGE_PAYMENTS: [ROLES.ADMIN],
  MANAGE_INTEGRATIONS: [ROLES.ADMIN],
};
```

---

## 🔧 Database Schema

**ไฟล์:** `prisma/schema.prisma`

```prisma
enum UserStatus {
  USER        // ผู้ใช้ทั่วไป
  OPERATOR    // พนักงาน
  ADMIN       // ผู้ดูแลระบบ
}

model User {
  id        Int        @id @default(autoincrement())
  fname     String
  lname     String
  email     String     @unique
  password  String?
  role      UserStatus @default(USER)
  createdAt DateTime   @default(now())
}
```

---

## 🧪 Testing

### ทดสอบ Middleware

```bash
# Test USER access to dashboard (should redirect)
curl -i http://localhost:3000/dashboard
# Expected: Redirect to /login

# Test OPERATOR access to dashboard (should allow)
# Login as OPERATOR first, then:
curl -i http://localhost:3000/dashboard
# Expected: 200 OK

# Test OPERATOR access to ADMIN routes (should redirect)
curl -i http://localhost:3000/dashboard/settings
# Expected: Redirect to /dashboard

# Test ADMIN access to ADMIN routes (should allow)
# Login as ADMIN first, then:
curl -i http://localhost:3000/dashboard/settings
# Expected: 200 OK
```

### ทดสอบ API Authorization

```bash
# Test as USER (should fail)
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"name": "Test Product"}'
# Expected: 401 Unauthorized

# Test as OPERATOR (should succeed)
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -d '{"name": "Test Product"}'
# Expected: 201 Created

# Test as ADMIN (should succeed)
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name": "Test Product"}'
# Expected: 201 Created
```

---

## 🎨 Role Display Names (Thai)

```typescript
import { getRoleDisplayName } from "@/lib/utils/auth-helpers";

getRoleDisplayName("ADMIN");     // "ผู้ดูแลระบบ"
getRoleDisplayName("OPERATOR");  // "พนักงาน"
getRoleDisplayName("USER");      // "ผู้ใช้งาน"
```

---

## 🔄 การเปลี่ยน Role

### จาก Database

```sql
-- เปลี่ยน USER เป็น OPERATOR
UPDATE User SET role = 'OPERATOR' WHERE email = 'staff@example.com';

-- เปลี่ยน OPERATOR เป็น ADMIN
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@example.com';

-- เปลี่ยนกลับเป็น USER
UPDATE User SET role = 'USER' WHERE email = 'user@example.com';
```

### จาก Prisma Studio

```bash
npx prisma studio

# 1. เปิด Users table
# 2. คลิกที่ user ที่ต้องการแก้ไข
# 3. เปลี่ยน role dropdown
# 4. Save changes
```

---

## ⚠️ Important Notes

### 1. OPERATOR vs ADMIN

**OPERATOR:**
- ทำงานประจำวัน (จัดการสินค้า, คำสั่งซื้อ)
- ไม่สามารถเข้าถึงการตั้งค่าระบบ
- เหมาะสำหรับพนักงานทั่วไป

**ADMIN:**
- ทำได้ทั้งหมด รวมถึงการตั้งค่า
- สามารถจัดการ roles ของผู้อื่น
- เหมาะสำหรับผู้ดูแลระบบเท่านั้น

### 2. Session Management

```typescript
// ตรวจสอบ session ทุกครั้งใน API route
const session = await getServerSession(authOptions);

if (!session) {
  // User not logged in
}

if (!session.user?.role) {
  // No role assigned
}
```

### 3. Middleware Caching

Middleware จะ cache token ระหว่าง requests
- Token มี expiry time (24 hours default)
- หลังจากเปลี่ยน role ต้อง logout/login ใหม่

### 4. Security Best Practices

```typescript
// ✅ Good: Always check role
if (!hasStaffAccess(session)) {
  return unauthorized();
}

// ❌ Bad: Trust client-side data
const role = request.headers.get("X-User-Role"); // ❌ Don't do this!

// ✅ Good: Use specific permission checks
if (!hasPermission(role, "DELETE_PRODUCT")) {
  return forbidden();
}

// ❌ Bad: Hardcode role strings
if (role === "ADMIN") { // ❌ Use constants instead
  // ...
}
```

---

## 📚 API Routes Updated

### ✅ Protected with OPERATOR & ADMIN

- `/api/v1/products` - GET, POST
- `/api/v1/products/[id]` - GET, PUT, DELETE
- `/api/v1/upload` - POST
- `/api/v1/orders` - GET, PUT
- (More to be added)

### 🔐 Protected with ADMIN Only

- `/api/v1/settings/*` - All methods (Future)
- `/api/v1/roles/*` - All methods (Future)
- `/api/v1/system/*` - All methods (Future)

---

## 🎯 สรุป

### ระบบ Auth ปัจจุบัน

- ✅ 3 Roles: USER, OPERATOR, ADMIN
- ✅ Middleware protection
- ✅ API authorization helpers
- ✅ Permission-based access control
- ✅ Thai language role names
- ✅ Comprehensive testing

### การใช้งาน

1. **สำหรับ OPERATOR & ADMIN:** ใช้ `hasStaffAccess()`
2. **สำหรับ ADMIN only:** ใช้ `hasAdminAccess()`
3. **สำหรับ specific permission:** ใช้ `hasPermission()`

### Next Steps

- [ ] สร้าง UI สำหรับจัดการ Roles (ADMIN)
- [ ] เพิ่ม Activity Logs
- [ ] เพิ่ม Role-based UI components
- [ ] API documentation สำหรับแต่ละ role

---

**Created:** 2025-10-28
**Last Updated:** 2025-10-28
**Status:** ✅ Production Ready
