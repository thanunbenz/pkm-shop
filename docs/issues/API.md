# API Documentation - PKM Shop

**Base URL:** `http://localhost:3000/api/v1`

---

## 🔐 Authentication

### Next-Auth Session-Based Authentication

**Headers Required:**
```
Cookie: next-auth.session-token=...
```

**Role-Based Access:**
- `USER` - ลูกค้าทั่วไป
- `OPERATOR` - พนักงาน (สามารถจัดการ products, codes)
- `ADMIN` - ผู้ดูแลระบบ (เข้าถึงได้ทุกอย่าง)

---

## 📦 Products API

### GET /products
ดึงรายการสินค้าทั้งหมด

**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Surging Sparks Booster Pack",
      "description": "10 cards per pack",
      "price": 149.00,
      "discountprice": 129.00,
      "issale": true,
      "isrecommend": true,
      "image": "/uploads/abc-123.jpg",
      "imageId": "26",
      "category": "PACK",
      "createdAt": "2025-10-31T00:00:00.000Z",
      "updatedAt": "2025-10-31T00:00:00.000Z",
      "code": [
        {
          "id": 1,
          "isUsed": false
        }
      ]
    }
  ]
}
```

---

### GET /products/:id
ดึงข้อมูลสินค้าตาม ID

**Access:** Public

**URL Parameters:**
- `id` (number) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Surging Sparks Booster Pack",
    "description": "10 cards per pack",
    "price": 149.00,
    "discountprice": 129.00,
    "issale": true,
    "isrecommend": true,
    "image": "/uploads/abc-123.jpg",
    "imageId": "26",
    "category": "PACK",
    "code": [
      {
        "id": 1,
        "code": "ABC123XYZ",
        "isUsed": false,
        "createdAt": "2025-10-31T00:00:00.000Z",
        "productId": 1
      }
    ]
  }
}
```

---

### GET /products/recommend
ดึงสินค้าแนะนำ (แสดงหน้า home)

**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    // ... สินค้าที่ isrecommend = true (สูงสุด 10 รายการ)
  ]
}
```

---

### POST /products
สร้างสินค้าใหม่

**Access:** OPERATOR, ADMIN

**Request Body:**
```json
{
  "name": "Surging Sparks Booster Pack",
  "description": "10 cards per pack",
  "price": 149.00,
  "discountprice": 129.00,
  "issale": true,
  "isrecommend": true,
  "image": "/uploads/abc-123.jpg",
  "imageId": "26",
  "category": "PACK"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    // ... product data
  }
}
```

---

### PUT /products/:id
แก้ไขสินค้า

**Access:** OPERATOR, ADMIN

**URL Parameters:**
- `id` (number) - Product ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 199.00,
  // ... ฟิลด์อื่นๆ ที่ต้องการแก้
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated product data
  }
}
```

**Known Issue:** ⚠️ ต้อง run `npx prisma generate` ก่อนใช้งาน

---

### DELETE /products/:id
ลบสินค้า

**Access:** OPERATOR, ADMIN

**URL Parameters:**
- `id` (number) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    // ... deleted product data
  },
  "imageId": "26"
}
```

**Side Effects:**
- ลบ codes ที่เกี่ยวข้องทั้งหมด (CASCADE)
- ลบรูปภาพจาก filesystem

---

## 🖼️ Upload API

### POST /upload
อัปโหลดไฟล์ใหม่

**Access:** OPERATOR, ADMIN

**Request:** multipart/form-data
```
file: [File]
```

**Allowed File Types:**
- image/jpeg (.jpg, .jpeg)
- image/png (.png)
- image/webp (.webp)
- application/pdf (.pdf)

**Max File Size:** 5MB

**Response:**
```json
{
  "message": "Upload successful",
  "file": {
    "id": 26,
    "name": "abc-123-456.jpg",
    "path": "/uploads/abc-123-456.jpg",
    "size": 245678
  }
}
```

**Validation:**
- ✅ MIME type check
- ✅ Magic bytes validation
- ✅ File size limit
- ✅ Path traversal protection

---

### GET /upload/:id
ดึงข้อมูลไฟล์

**Access:** OPERATOR, ADMIN

**Response:**
```json
{
  "id": 26,
  "name": "abc-123-456.jpg",
  "path": "/uploads/abc-123-456.jpg",
  "size": 245678,
  "createdAt": "2025-10-31T00:00:00.000Z"
}
```

---

### PUT /upload/:id
แทนที่ไฟล์

**Access:** OPERATOR, ADMIN

**Request:** multipart/form-data
```
file: [File]
```

**Response:**
```json
{
  "file": {
    "id": 26,
    "name": "new-file-456.jpg",
    "path": "/uploads/new-file-456.jpg",
    "size": 345678
  }
}
```

**Side Effects:**
- ลบไฟล์เก่าจาก filesystem
- อัพเดท products/banners ที่ใช้ไฟล์นี้

---

### DELETE /upload/:id
ลบไฟล์

**Access:** OPERATOR, ADMIN

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

**Side Effects:**
- ลบไฟล์จาก filesystem
- ลบ record จาก database

---

## 🛒 Cart API

### GET /cart/:userId
ดึงตะกร้าของ user

**Access:** Public (ต้องมี userId)

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "productId": 1,
      "name": "Surging Sparks Booster Pack",
      "price": 149.00,
      "discountprice": 129.00,
      "issale": true,
      "image": "/uploads/abc-123.jpg",
      "quantity": 2,
      "availableStock": 5
    }
  ]
}
```

---

### POST /cart
เพิ่มสินค้าลงตะกร้า

**Access:** Public

**Request Body:**
```json
{
  "userId": 1,
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "createdAt": "2025-10-31T00:00:00.000Z",
    "updatedAt": "2025-10-31T00:00:00.000Z"
  }
}
```

---

### PUT /cart
อัพเดทจำนวนสินค้าในตะกร้า

**Access:** Public

**Request Body:**
```json
{
  "userId": 1,
  "productId": 1,
  "quantity": 3
}
```

**Note:** ถ้า quantity = 0 จะลบสินค้าออก

---

### DELETE /cart
ลบสินค้าออกจากตะกร้า

**Access:** Public

**Request Body:**
```json
{
  "userId": 1,
  "productId": 1
}
```

---

### POST /cart/sync
Sync cart จาก localStorage เข้า server (เมื่อ login)

**Access:** Public

**Request Body:**
```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Behavior:**
- ถ้าสินค้ามีอยู่แล้วใน server cart = เพิ่ม quantity
- ถ้าไม่มี = สร้างใหม่

---

### DELETE /cart/:userId
ล้างตะกร้าทั้งหมด

**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 🎨 Banners API

### GET /banners
ดึงรายการ banners ทั้งหมด

**Access:** Public (เฉพาะที่ isActive = true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "title": "Surging Sparks Sale",
      "description": "50% off all booster packs",
      "image": "/uploads/banner-123.jpg",
      "imageId": "27",
      "link": "/products/1",
      "isActive": true,
      "order": 0,
      "createdAt": "2025-10-31T00:00:00.000Z",
      "updatedAt": "2025-10-31T00:00:00.000Z"
    }
  ]
}
```

---

### POST /banners
สร้าง banner ใหม่

**Access:** ADMIN

**Request Body:**
```json
{
  "title": "Surging Sparks Sale",
  "description": "50% off all booster packs",
  "image": "/uploads/banner-123.jpg",
  "imageId": "27",
  "link": "/products/1",
  "isActive": true,
  "order": 0
}
```

---

### PUT /banners/:id
แก้ไข banner

**Access:** ADMIN

---

### DELETE /banners/:id
ลบ banner

**Access:** ADMIN

**Side Effects:**
- ลบรูปภาพ banner

---

## 🏷️ Codes API

### GET /code/product/:productId
ดึง codes ของสินค้า

**Access:** OPERATOR, ADMIN

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ABC123XYZ",
      "isUsed": false,
      "createdAt": "2025-10-31T00:00:00.000Z",
      "productId": 1
    }
  ]
}
```

---

### POST /code
สร้าง code ใหม่

**Access:** OPERATOR, ADMIN

**Request Body:**
```json
{
  "code": "ABC123XYZ",
  "productId": 1
}
```

---

### PUT /code/:id
แก้ไข code

**Access:** OPERATOR, ADMIN

**Request Body:**
```json
{
  "code": "UPDATED123"
}
```

---

### DELETE /code/:id
ลบ code

**Access:** OPERATOR, ADMIN

---

## ⚙️ Settings API

### GET /settings
ดึงการตั้งค่าเว็บไซต์

**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "welcomeTitle": "Welcome to PKM Shop",
    "welcomeSubtitle": "Your one-stop shop for Pokémon TCG Live codes",
    "showWelcome": true,
    "createdAt": "2025-10-31T00:00:00.000Z",
    "updatedAt": "2025-10-31T00:00:00.000Z"
  }
}
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request body",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You must be an OPERATOR or ADMIN to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "details": "..."
}
```

---

## 🔒 Rate Limiting

**Upload Endpoints:**
- Limit: 10 requests per minute per IP
- Headers:
  ```
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 9
  X-RateLimit-Reset: 2025-10-31T00:01:00.000Z
  ```

---

## 📝 Notes

1. **Prisma Generate Required:**
   - หลังเพิ่ม Cart model ต้อง run `npx prisma generate`
   - ไม่เช่นนั้น Product UPDATE จะ error

2. **Image URLs:**
   - เก็บแบบ relative path: `/uploads/filename.jpg`
   - Access ที่: `http://localhost:3000/uploads/filename.jpg`

3. **Cart System:**
   - Guest users: localStorage
   - Logged in: Database + localStorage sync

4. **Stock Calculation:**
   - `availableStock = code.filter(c => !c.isUsed).length`

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Seed data (optional)
npm run seed

# Start dev server
npm run dev
```
