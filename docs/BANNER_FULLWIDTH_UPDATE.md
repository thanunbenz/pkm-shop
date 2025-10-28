# Banner Full Width Update

## วันที่: 2025-10-28

## การเปลี่ยนแปลง

### ปัญหา
- Banner อยู่ใน container (มี padding ซ้าย-ขวา)
- มี rounded corners
- ไม่กว้างเต็มจอ

### การแก้ไข

#### 1. ย้าย Banner ออกจาก Container
**ไฟล์:** [src/app/(main)/page.tsx](../src/app/(main)/page.tsx)

**Before:**
```tsx
<main className="container mx-auto px-4 py-8">
  <div className="mb-8">
    <BannerSlider />
  </div>
  ...
</main>
```

**After:**
```tsx
<>
  {/* Banner Slider - Full Width */}
  <BannerSlider />

  {/* Content Section */}
  <main className="container mx-auto px-4 py-8">
    ...
  </main>
</>
```

#### 2. ลบ Rounded Corners
**ไฟล์:** [src/components/ui/BannerSlider.tsx](../src/components/ui/BannerSlider.tsx)

**เปลี่ยนจาก:**
```tsx
className="w-full h-[400px] md:h-[500px] ... rounded-lg"
```

**เป็น:**
```tsx
className="w-full h-[400px] md:h-[500px] ..."
```

## ผลลัพธ์

✅ **Banner เต็มความกว้างของจอ**
- ไม่มี padding ซ้าย-ขวา
- ชิดกับ NavBar ด้านบน
- ไม่มี rounded corners

✅ **Content Section**
- ยังคงอยู่ใน container
- มี padding ปกติ
- อ่านง่าย ไม่กว้างเกินไป

## Layout Structure

```
┌─────────────────────────────────────┐
│          NavBar (Full Width)        │
├─────────────────────────────────────┤
│      Banner Slider (Full Width)     │ ← เต็มจอ
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │    Content (Container)      │   │ ← มี padding
│  │  - Welcome Section          │   │
│  │  - Product Cards            │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│         Footer (Full Width)         │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥768px)
- Banner height: **500px**
- Full width: **100vw**
- No margins, no padding

### Mobile (<768px)
- Banner height: **400px**
- Full width: **100vw**
- No margins, no padding

## CSS Classes ที่เปลี่ยน

### BannerSlider.tsx

| Element | Before | After |
|---------|--------|-------|
| Loading state | `rounded-lg` | ลบออก |
| Empty state | `rounded-lg` | ลบออก |
| Main container | `rounded-lg` | ลบออก |

### page.tsx

| Element | Before | After |
|---------|--------|-------|
| Banner wrapper | Inside `<main>` container | Outside, direct child of fragment |
| Main content | Same level as banner | Separate `<main>` tag |

## Files Changed

1. ✅ [src/app/(main)/page.tsx](../src/app/(main)/page.tsx)
   - ย้าย `<BannerSlider />` ออกจาก `<main>`
   - เปลี่ยนโครงสร้างเป็น Fragment

2. ✅ [src/components/ui/BannerSlider.tsx](../src/components/ui/BannerSlider.tsx)
   - ลบ `rounded-lg` class ออกจากทุก state

## Testing Checklist

- [ ] Banner กว้างเต็มจอ
- [ ] ชิดกับ NavBar (ไม่มีช่องว่าง)
- [ ] ไม่มี rounded corners
- [ ] Auto-slide ยังทำงาน
- [ ] Responsive ทำงานถูกต้อง
- [ ] Content section ยังอยู่ใน container

## Notes

- Banner ตอนนี้จะกว้างเต็มจอ 100%
- ไม่มี max-width
- เหมาะสำหรับ banner ขนาดใหญ่ (แนะนำ 1920x500px)
- Content ส่วนอื่นยังคงอยู่ใน container เพื่อความสวยงาม

## ตัวอย่างการใช้งาน

```tsx
// homepage layout
<>
  <BannerSlider />  {/* Full width, no container */}

  <main className="container mx-auto px-4 py-8">
    {/* Content with container */}
  </main>
</>
```

---

**Updated by:** Claude Code
**Date:** 2025-10-28
