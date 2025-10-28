# API Paths Fix Documentation

## วันที่: 2025-10-28

## ปัญหาที่พบ

### Error Messages
```
[Error] Failed to load resource: the server responded with a status of 404 (Not Found) (count, line 0)
[Error] Unhandled Promise Rejection: SyntaxError: The string did not match the expected pattern.
```

### สาเหตุ
- Frontend เรียก API paths แบบเก่า: `/api/products/*`, `/api/upload/*`, `/api/code/*`
- แต่ API จริงอยู่ที่: `/api/v1/*`
- ทำให้เกิด 404 errors และ JSON parsing errors

## การแก้ไข

### 1. useStore.ts ✅
**ไฟล์**: [src/store/useStore.ts](../src/store/useStore.ts)

#### Before
```typescript
const response = await fetch("/api/products/count");
const response = await fetch("/api/code/count");
```

#### After
```typescript
const response = await fetch("/api/v1/products/count");
const response = await fetch("/api/v1/code/count");
```

**เพิ่ม**: Error handling ด้วย try-catch

---

### 2. editProduct.tsx ✅
**ไฟล์**: [src/features/products/components/editProduct.tsx](../src/features/products/components/editProduct.tsx)

#### API Calls ที่แก้
1. `GET /api/products/${id}` → `/api/v1/products/${id}`
2. `POST /api/upload` → `/api/v1/upload`
3. `PUT /api/upload/${id}` → `/api/v1/upload/${id}`
4. `PUT /api/products/${id}` → `/api/v1/products/${id}`

**เพิ่ม**:
- Error handling
- Response structure handling (`result.data`)
- Content-Type header

---

### 3. AddProductButton.tsx ✅
**ไฟล์**: [src/components/ui/AddProductButton.tsx](../src/components/ui/AddProductButton.tsx)

#### API Calls ที่แก้
1. `POST /api/upload` → `/api/v1/upload`
2. `POST /api/products` → `/api/v1/products`
3. `DELETE /api/upload/${id}` → `/api/v1/upload/${id}`

---

## สรุป API Endpoints ที่ถูกต้อง

### Products
- `GET /api/v1/products` - ดึงรายการสินค้าทั้งหมด
- `GET /api/v1/products/:id` - ดึงข้อมูลสินค้า 1 รายการ
- `POST /api/v1/products` - สร้างสินค้าใหม่
- `PUT /api/v1/products/:id` - อัปเดตสินค้า
- `DELETE /api/v1/products/:id` - ลบสินค้า
- `GET /api/v1/products/count` - นับจำนวนสินค้า

### Upload
- `POST /api/v1/upload` - อัปโหลดไฟล์
- `PUT /api/v1/upload/:id` - อัปเดตไฟล์
- `DELETE /api/v1/upload/:id` - ลบไฟล์
- `GET /api/v1/upload/:id` - ดึงข้อมูลไฟล์

### Authentication
- `POST /api/v1/register` - ลงทะเบียนผู้ใช้
- `/api/auth/[...nextauth]` - NextAuth endpoints (ไม่ใช้ v1)
- `/api/auth/refresh` - Refresh token (ไม่ใช้ v1)

### Code (ถ้ามี)
- `GET /api/v1/code/count` - นับจำนวนโค้ด

---

## การทดสอบ

### 1. ทดสอบ Product Count
```bash
curl http://localhost:3000/api/v1/products/count
# Expected: {"count":25}
```

### 2. ทดสอบใน Browser Console
```javascript
// ควรได้ผลลัพธ์ไม่มี 404 errors
fetch('/api/v1/products/count').then(r => r.json()).then(console.log)
```

### 3. ทดสอบ Features
- ✅ Dashboard แสดงจำนวนสินค้าถูกต้อง
- ✅ เพิ่มสินค้าใหม่ได้
- ✅ แก้ไขสินค้าได้
- ✅ อัปโหลดรูปภาพได้
- ✅ ลบสินค้าได้

---

## ไฟล์ที่เกี่ยวข้อง

```
src/
├── store/
│   └── useStore.ts                          ✅ แก้แล้ว
├── features/products/components/
│   └── editProduct.tsx                      ✅ แก้แล้ว
├── components/ui/
│   └── AddProductButton.tsx                 ✅ แก้แล้ว
└── app/api/
    ├── v1/
    │   ├── products/
    │   │   ├── route.ts                     ✅ Endpoint
    │   │   ├── [id]/route.ts                ✅ Endpoint
    │   │   └── count/route.ts               ✅ Endpoint
    │   ├── upload/
    │   │   ├── route.ts                     ✅ Endpoint
    │   │   └── [id]/route.ts                ✅ Endpoint
    │   └── register/route.ts                ✅ Endpoint
    └── auth/
        ├── [...nextauth]/route.ts           ✅ Endpoint (no v1)
        └── refresh/route.ts                 ✅ Endpoint (no v1)
```

---

## Best Practices

### 1. สร้าง API Client Helper (แนะนำ)
```typescript
// src/lib/api-client.ts
const API_BASE = '/api/v1';

export const apiClient = {
  products: {
    getAll: () => fetch(`${API_BASE}/products`),
    getById: (id: string) => fetch(`${API_BASE}/products/${id}`),
    create: (data: any) => fetch(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetch(`${API_BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }),
    count: () => fetch(`${API_BASE}/products/count`),
  },
  upload: {
    create: (file: FormData) => fetch(`${API_BASE}/upload`, { method: 'POST', body: file }),
    update: (id: string, file: FormData) => fetch(`${API_BASE}/upload/${id}`, { method: 'PUT', body: file }),
    delete: (id: string) => fetch(`${API_BASE}/upload/${id}`, { method: 'DELETE' }),
  },
};
```

### 2. Error Handling Pattern
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error (show toast, etc.)
  return null;
}
```

### 3. TypeScript Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## ผลลัพธ์

✅ **แก้สำเร็จ**: 404 errors หมดแล้ว
✅ **แก้สำเร็จ**: JSON parsing errors หมดแล้ว
✅ **ปรับปรุง**: เพิ่ม error handling
✅ **ทดสอบ**: API endpoints ทำงานถูกต้อง

---

## TODO ต่อไป (Optional)

- [ ] สร้าง API client helper เพื่อจัดการ paths แบบรวมศูนย์
- [ ] เพิ่ม TypeScript types สำหรับ API responses
- [ ] เพิ่ม loading states ใน UI
- [ ] เพิ่ม retry logic สำหรับ failed requests
