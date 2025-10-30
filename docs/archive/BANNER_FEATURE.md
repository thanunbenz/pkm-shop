# Banner Slider Feature Documentation

## วันที่: 2025-10-28

## Overview

เพิ่ม Banner Slider Feature ที่หน้าแรก พร้อมระบบจัดการ Banner ใน Dashboard แบบ Full CRUD

## Features

### 1. Banner Slider (หน้าแรก)
- ✅ Auto slide ทุก 5 วินาที
- ✅ Navigation arrows (แสดงเมื่อ hover)
- ✅ Dots indicator
- ✅ รองรับ responsive design
- ✅ แสดง placeholder เมื่อไม่มี banner
- ✅ รองรับ link ไปยังหน้าอื่น
- ✅ Gradient overlay สำหรับอ่านข้อความง่ายขึ้น

### 2. Banner Management Dashboard
- ✅ CRUD Operations (Create, Read, Update, Delete)
- ✅ Upload รูปภาพผ่าน drag & drop
- ✅ Toggle active/inactive status
- ✅ จัดลำดับการแสดงผล (order)
- ✅ ใส่ link URL
- ✅ Real-time preview
- ✅ เฉพาะ ADMIN/OPERATOR เท่านั้น

## Database Schema

### Banner Model
```prisma
model Banner {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  image       String   @db.Text
  imageId     String?
  link        String?  @db.Text
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, order])
}
```

**Fields:**
- `id` - UUID primary key
- `title` - ชื่อ banner (required)
- `description` - คำอธิบาย (optional)
- `image` - URL ของรูปภาพ (required)
- `imageId` - Foreign key ไปยัง File model
- `link` - URL ที่จะ redirect เมื่อคลิก banner
- `isActive` - สถานะการแสดงผล
- `order` - ลำดับการแสดงผล (น้อย = แสดงก่อน)

## API Endpoints

### GET /api/v1/banners
ดึงรายการ banners ทั้งหมดที่ active
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Banner Title",
      "description": "Banner Description",
      "image": "/uploads/banner.jpg",
      "imageId": "file-id",
      "link": "https://example.com",
      "isActive": true,
      "order": 0,
      "createdAt": "2025-10-28T00:00:00.000Z",
      "updatedAt": "2025-10-28T00:00:00.000Z"
    }
  ]
}
```

**Access:** Public

---

### POST /api/v1/banners
สร้าง banner ใหม่

**Request Body:**
```json
{
  "title": "Banner Title",
  "description": "Banner Description",
  "image": "/uploads/banner.jpg",
  "imageId": "file-id",
  "link": "https://example.com",
  "isActive": true,
  "order": 0
}
```

**Access:** ADMIN/OPERATOR only

---

### GET /api/v1/banners/:id
ดึงข้อมูล banner ตาม ID

**Access:** Public

---

### PUT /api/v1/banners/:id
อัปเดต banner

**Request Body:** เหมือน POST

**Access:** ADMIN/OPERATOR only

---

### DELETE /api/v1/banners/:id
ลบ banner

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "imageId": "file-id"
}
```

**Access:** ADMIN/OPERATOR only

## Components

### 1. BannerSlider Component
**ไฟล์:** [src/components/ui/BannerSlider.tsx](../src/components/ui/BannerSlider.tsx)

**Props:** ไม่มี (fetch data เอง)

**Features:**
- Auto-play slider (5 วินาที)
- Manual navigation (arrows, dots)
- Responsive design
- Loading state
- Empty state (placeholder)
- Link support

**Usage:**
```tsx
import BannerSlider from "@/components/ui/BannerSlider";

<BannerSlider />
```

---

### 2. Banner Management Page
**ไฟล์:** [src/app/(dashboard)/banner/page.tsx](../src/app/(dashboard)/banner/page.tsx)

**Features:**
- Grid layout แสดง banners
- Modal form สำหรับ create/edit
- Image upload with drag & drop
- Toggle active status
- Delete with confirmation
- Real-time updates

**Access:** /banner (Dashboard route)

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── page.tsx                         ✅ เพิ่ม BannerSlider
│   ├── (dashboard)/
│   │   └── banner/
│   │       └── page.tsx                     ✅ Banner Management
│   └── api/v1/banners/
│       ├── route.ts                         ✅ GET, POST
│       └── [id]/route.ts                    ✅ GET, PUT, DELETE
├── components/
│   ├── ui/
│   │   └── BannerSlider.tsx                 ✅ Slider Component
│   └── layout/
│       └── DashboardSidebar.tsx             ✅ เพิ่ม Banner menu
└── prisma/
    ├── schema.prisma                        ✅ Banner model
    └── migrations/
        └── 20251028082009_add_banner_model/ ✅ Migration
```

## Usage Guide

### การเพิ่ม Banner ใหม่

1. เข้าสู่ Dashboard → Banner
2. คลิก "เพิ่ม Banner"
3. กรอกข้อมูล:
   - ชื่อ Banner (required)
   - คำอธิบาย (optional)
   - Link URL (optional)
   - ลำดับ (0 = แสดงก่อน)
   - เปิดใช้งาน (checkbox)
4. อัปโหลดรูปภาพ (แนะนำ 1920x500px)
5. คลิก "บันทึก"

### การแก้ไข Banner

1. คลิกปุ่ม "แก้ไข" ที่ banner ที่ต้องการ
2. แก้ไขข้อมูลในฟอร์ม
3. คลิก "บันทึก"

### การเปิด/ปิด Banner

- คลิกปุ่ม "Active/Inactive" เพื่อเปลี่ยนสถานะ
- Banner ที่ Inactive จะไม่แสดงในหน้าแรก

### การลบ Banner

1. คลิกปุ่ม "ลบ"
2. ยืนยันการลบ
3. รูปภาพที่เกี่ยวข้องจะถูกลบด้วย

## Responsive Design

### Desktop (≥1024px)
- Banner height: 500px
- แสดง arrows เมื่อ hover
- แสดง dots indicator

### Mobile (<1024px)
- Banner height: 400px
- Touch swipe support (browser native)
- แสดง dots indicator

## Image Recommendations

### Banner Image Specs
- **ขนาดแนะนำ:** 1920x500px (ratio 3.84:1)
- **Format:** JPG, PNG
- **Max size:** 5MB
- **Quality:** High (80-90%)

### Optimization Tips
1. ใช้ Next.js Image component (auto optimization)
2. Lazy load สำหรับ banners ที่ไม่ใช่ตัวแรก
3. Use WebP format ถ้าเป็นไปได้
4. Compress images ก่อน upload

## Security

### Authentication
- API POST/PUT/DELETE ต้อง authenticate
- เฉพาะ role ADMIN/OPERATOR
- ใช้ `hasStaffAccess()` helper

### Authorization
```typescript
const session = await getServerSession(authOptions);

if (!hasStaffAccess(session)) {
  return NextResponse.json(
    { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
    { status: 401 }
  );
}
```

## Performance

### Optimizations
1. **Caching:** Browser cache สำหรับ images
2. **Lazy Loading:** Banners load เมื่อเข้าหน้า
3. **Auto-play:** ใช้ setInterval (cleanup ใน useEffect)
4. **Image Optimization:** Next.js Image component

### Loading States
- Skeleton loading สำหรับ BannerSlider
- Loading indicator เมื่ออัปโหลดรูป
- Disabled buttons ขณะ submit

## Testing Checklist

### Frontend
- [ ] Banner slider แสดงผลถูกต้อง
- [ ] Auto-play ทำงาน (5 วินาที)
- [ ] Navigation arrows ทำงาน
- [ ] Dots indicator ทำงาน
- [ ] Link redirect ถูกต้อง
- [ ] Responsive design
- [ ] Empty state แสดงถูกต้อง

### Dashboard
- [ ] เพิ่ม banner ได้
- [ ] แก้ไข banner ได้
- [ ] ลบ banner ได้
- [ ] Upload รูปภาพได้
- [ ] Toggle active/inactive ได้
- [ ] เรียงลำดับได้
- [ ] เฉพาะ ADMIN/OPERATOR เข้าถึง

### API
- [ ] GET /api/v1/banners - ดึง active banners
- [ ] POST /api/v1/banners - สร้าง banner (auth required)
- [ ] PUT /api/v1/banners/:id - อัปเดต banner (auth required)
- [ ] DELETE /api/v1/banners/:id - ลบ banner (auth required)

## Future Enhancements

### Phase 2 (Optional)
- [ ] Schedule banner (start/end date)
- [ ] A/B testing support
- [ ] Click tracking analytics
- [ ] Multi-language support
- [ ] Video banner support
- [ ] Banner templates
- [ ] Bulk upload
- [ ] Export/Import banners

## Migration

### Database Migration
```bash
npx prisma migrate dev --name add_banner_model
```

### Rollback (ถ้าจำเป็น)
```bash
# ลบ migration folder
rm -rf prisma/migrations/20251028082009_add_banner_model

# Reset database
npx prisma migrate reset
```

## Troubleshooting

### Banner ไม่แสดง
1. ตรวจสอบ isActive = true
2. ตรวจสอบ API endpoint (/api/v1/banners)
3. Check browser console สำหรับ errors
4. ตรวจสอบ permissions (CORS)

### รูปภาพไม่แสดง
1. ตรวจสอบ path ถูกต้อง
2. ตรวจสอบไฟล์มีอยู่จริงใน public/uploads
3. Check Next.js Image domains config
4. ตรวจสอบ file permissions

### Upload ไม่ได้
1. ตรวจสอบ file size (<5MB)
2. ตรวจสอบ file type (image/*)
3. Check API endpoint (/api/v1/upload)
4. ตรวจสอบ authentication

## Summary

✅ **สร้างสำเร็จ**: Banner Slider System แบบ Full-featured
✅ **Frontend**: BannerSlider component พร้อม auto-play
✅ **Backend**: API CRUD operations
✅ **Dashboard**: Banner Management UI
✅ **Security**: ADMIN/OPERATOR only access
✅ **Responsive**: รองรับทุก screen sizes
✅ **Documentation**: ครบถ้วน

---

**Created by:** Claude Code
**Date:** 2025-10-28
