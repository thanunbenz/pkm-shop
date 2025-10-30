# NavBar Component Refactor

## วันที่: 2025-10-28

## สรุปการแก้ไข

### ปัญหาที่พบ
1. **Dropdown ไม่ทำงาน** - Event listener cleanup ไม่ถูกต้อง มีการใช้ setTimeout ที่ไม่จำเป็น
2. **การเช็ค Session ไม่ติด** - useSession() อาจมีปัญหาเพราะไม่มี loading state
3. **Styling ซ้ำซ้อน** - rounded-t ใช้ซ้ำใน Profile link
4. **Logout เป็น Link แทน button** - ควรเป็น button element
5. **ขาด Mobile search bar** - มีเฉพาะ desktop
6. **ใช้ `<a>` แทน `<Link>`** - ใน category links

### การแก้ไขที่ทำ

#### 1. ปรับปรุง Event Handlers
```tsx
// ลบ setTimeout ที่ไม่จำเป็นออก
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  if (isDropdownOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isDropdownOpen]);
```

#### 2. สร้าง Helper Functions
```tsx
const handleSearch = (query: string) => {
  if (query.trim()) {
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  }
};

const handleLogout = async (e: React.MouseEvent) => {
  e.preventDefault();
  await signOut({ callbackUrl: "/", redirect: true });
};

const toggleDropdown = (e: React.MouseEvent) => {
  e.stopPropagation();
  setDropdownOpen((prev) => !prev);
};
```

#### 3. ปรับปรุง Dropdown UI
- เปลี่ยนจาก `w-32` เป็น `w-40` (กว้างขึ้น)
- เปลี่ยนจาก `rounded` เป็น `rounded-lg`
- เพิ่ม `z-50` แทน `z-20` (ป้องกันถูกบัง)
- เพิ่ม `overflow-hidden` เพื่อให้ border radius ทำงาน
- ใช้ border-t แทน rounded-t สำหรับแบ่ง section
- เปลี่ยน Logout เป็น `<button>` แทน `<Link>`
- เพิ่มสี text-red-600 ให้ Logout button

#### 4. เพิ่ม Mobile Features
- เพิ่ม mobile search bar
- เปลี่ยน icon ของ mobile menu เป็น X เมื่อเปิด
- เพิ่ม onClick close menu เมื่อคลิก link ใน mobile menu

#### 5. ปรับปรุง Accessibility
- เพิ่ม `aria-label` และ `aria-expanded` attributes
- เปลี่ยน shopping bag จาก `<div>` เป็น `<button>`
- ใช้ semantic HTML ที่ถูกต้อง

#### 6. ปรับปรุง Styling
- เพิ่ม `transition-colors` และ `transition-opacity`
- เพิ่ม `focus:ring-2` ใน search input
- ใช้ `hover:bg-gray-50` แทน `hover:bg-gray-200` (เบาลง)
- เปลี่ยน category links จาก `<a>` เป็น `<Link>`

#### 7. Code Organization
- ลบ eslint-disable comment
- ลบ unused variable `status`
- จัดกลุ่ม imports ให้เรียบร้อย
- เพิ่ม comments แบ่ง sections

## โครงสร้างไฟล์

```
src/components/layout/
└── NavBar.tsx (Refactored)
```

## ส่วนประกอบหลัก

1. **Logo Section** - Link กลับหน้าหลัก
2. **Search Bar** - แยกเป็น desktop และ mobile
3. **Shopping Bag** - แสดงจำนวนสินค้า
4. **User Dropdown** - แสดง menu ตามสถานะ login
5. **Mobile Menu Toggle** - เปิด/ปิด mobile menu
6. **Category Links** - แสดงหมวดหมู่สินค้า

## Dependencies

- next/link
- next-auth/react
- next/navigation
- @fortawesome/react-fontawesome
- @fortawesome/free-solid-svg-icons

## หมายเหตุ

- Component นี้เป็น Client Component (`"use client"`)
- ต้องมี `SessionProvider` ครอบที่ layout level
- Dropdown จะปิดเมื่อคลิกข้างนอก
- รองรับ responsive design (mobile/desktop)

## การทดสอบ

กรุณาทดสอบ:
1. ✅ กด user icon ให้แสดง dropdown
2. ✅ คลิกข้างนอก dropdown ให้ปิดอัตโนมัติ
3. ✅ Login/Logout ทำงานถูกต้อง
4. ✅ Session check แสดงเมนูตาม role (ADMIN/OPERATOR)
5. ✅ Mobile menu ทำงานถูกต้อง
6. ✅ Search bar ทำงานทั้ง desktop และ mobile
7. ✅ Category links สามารถคลิกได้
