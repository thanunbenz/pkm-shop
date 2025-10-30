# การเปลี่ยนแปลงจาก Custom DataTable เป็น DataTables.net

## ภาพรวม
เอกสารนี้อธิบายการเปลี่ยนแปลงจาก DataTable component ที่สร้างเองเป็นการใช้ [DataTables.net](https://datatables.net) ซึ่งเป็น jQuery plugin ที่มีความสามารถครบครันสำหรับการจัดการตารางข้อมูล

## วันที่อัปเดต
28 ตุลาคม 2025

---

## สิ่งที่เปลี่ยนแปลง

### 1. Dependencies ที่เพิ่มเข้ามา

```json
{
  "datatables.net": "^2.x.x",
  "datatables.net-dt": "^2.x.x",
  "datatables.net-responsive-dt": "^2.x.x",
  "datatables.net-buttons-dt": "^2.x.x",
  "datatables.net-buttons": "^2.x.x",
  "jszip": "^3.x.x",
  "pdfmake": "^0.2.x"
}
```

### 2. ไฟล์ที่แก้ไข

#### 📄 `src/components/ui/DataTable.tsx`
- เปลี่ยนจาก Custom React component เป็นการใช้ DataTables.net
- ลบ State Management ที่ทำเองออก (pagination, sorting, filtering)
- ใช้ DataTables API แทน
- รักษาฟังก์ชัน `handleDelete` ไว้เหมือนเดิม

**ฟีเจอร์หลัก:**
- ✅ การค้นหาแบบ real-time
- ✅ การเรียงลำดับข้อมูลทุกคอลัมน์
- ✅ Pagination พร้อม page length selection
- ✅ Responsive design
- ✅ การลบข้อมูลพร้อม confirmation
- ✅ Auto-refresh เมื่อมีการเปลี่ยนแปลงข้อมูล

#### 📄 `src/app/globals.css`
เพิ่ม CSS สำหรับ DataTables:

```css
/* DataTables CSS */
@import 'datatables.net-dt';
@import 'datatables.net-responsive-dt';
@import 'datatables.net-buttons-dt';

/* Custom styling for Tailwind integration */
```

---

## โครงสร้าง Component ใหม่

### Import Statements

```typescript
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
```

### Configuration

```typescript
dataTableRef.current = new DataTable(tableRef.current, {
    data: products,
    responsive: true,
    pageLength: 10,
    lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
    order: [[0, 'asc']],
    columns: [...],
    language: {...},
    dom: '<"flex flex-col md:flex-row justify-between items-center mb-4 gap-3"lf>rt<"flex flex-col md:flex-row justify-between items-center mt-4 gap-3"ip>',
});
```

---

## คอลัมน์ของตาราง

| คอลัมน์ | ข้อมูล | Orderable | Searchable | หมายเหตุ |
|---------|--------|-----------|------------|----------|
| No. | ลำดับที่ | ❌ | ❌ | Auto-increment |
| Image | รูปภาพสินค้า | ❌ | ❌ | แสดงภาพขนาด 80x80px |
| Name | ชื่อสินค้า | ✅ | ✅ | - |
| Price | ราคาสินค้า | ✅ | ✅ | แสดง 2 ทศนิยม |
| Sale | สถานะลดราคา | ✅ | ✅ | แสดงเป็นสัญลักษณ์ ✓/✗ |
| Recommend | แนะนำ | ✅ | ✅ | แสดงเป็นสัญลักษณ์ ✓/✗ |
| Category | หมวดหมู่ | ✅ | ✅ | - |
| Stock | จำนวนคงเหลือ | ✅ | ✅ | นับจาก code array |
| Actions | การดำเนินการ | ❌ | ❌ | Edit, Delete |

---

## ฟีเจอร์ที่มีใน DataTables.net

### 🔍 การค้นหา (Search)
- ค้นหาแบบ global search ทุกคอลัมน์
- Real-time filtering
- ภาษาไทย: "Search products:"

### 📊 การเรียงลำดับ (Sorting)
- คลิกที่หัวคอลัมน์เพื่อเรียงลำดับ
- รองรับการเรียงแบบ ascending/descending
- Multi-column sorting (กด Shift + Click)

### 📄 Pagination
- แสดงข้อมูลแบบแบ่งหน้า
- ตัวเลือก: 5, 10, 25, 50, All
- แสดงข้อมูลว่ากำลังดูหน้าไหน จำนวนเท่าไหร่

### 📱 Responsive
- ปรับตัวตามขนาดหน้าจอ
- ซ่อนคอลัมน์ที่ไม่สำคัญบนหน้าจอเล็ก
- แสดง + button เพื่อดูรายละเอียดเพิ่มเติม

### 🔄 Auto Refresh
- รีเฟรชตารางอัตโนมัติเมื่อมีการเพิ่ม/ลบ/แก้ไขข้อมูล
- ใช้ Zustand store เพื่อติดตามการเปลี่ยนแปลง

---

## การทำงานร่วมกับ Zustand Store

```typescript
const { listProducts, retrieveProductCount } = useStore();

useEffect(() => {
    const fetchProducts = async () => {
        const response = await fetch("/api/v1/products");
        const data = await response.json();
        if (data.success) {
            setProducts(data.data);
        }
    };

    if (listProducts > 0) {
        fetchProducts();
    }
    retrieveProductCount();
}, [listProducts]);
```

---

## การลบข้อมูล (Delete Functionality)

### Flow การลบ:
1. คลิกปุ่ม Delete
2. แสดง confirmation dialog
3. ลบรูปภาพ (ถ้ามี) และข้อมูลสินค้า
4. Refresh ตารางอัตโนมัติ

```typescript
drawCallback: function() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = target.getAttribute('data-id');
            if (id && confirm('Are you sure?')) {
                await handleDelete(id);
                // Auto refresh
                const response = await fetch("/api/v1/products");
                const data = await response.json();
                if (data.success) {
                    setProducts(data.data);
                }
            }
        });
    });
}
```

---

## Custom Styling

### Tailwind Integration
DataTables ถูกปรับแต่งให้เข้ากับ Tailwind CSS:

```css
.dataTables_wrapper .dataTables_length select,
.dataTables_wrapper .dataTables_filter input {
  @apply border border-gray-300 rounded-lg px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current {
  @apply bg-blue-600 text-white border-blue-600 font-semibold;
}
```

---

## ข้อดีของการใช้ DataTables.net

### ✅ Pros
1. **ฟีเจอร์ครบครัน** - มีความสามารถมากมายที่พร้อมใช้งาน
2. **Performance** - Optimize แล้วสำหรับข้อมูลจำนวนมาก
3. **Responsive** - รองรับหน้าจอทุกขนาด
4. **ปรับแต่งง่าย** - มี API ที่ครบถ้วน
5. **Community Support** - เอกสารและ community มีมาก
6. **Plugin System** - ขยายความสามารถได้ง่าย
7. **ลดโค้ด** - ไม่ต้องเขียน pagination/sorting/filtering เอง

### ⚠️ Considerations
1. **Bundle Size** - ขนาดไฟล์ใหญ่ขึ้นเล็กน้อย
2. **jQuery Dependency** - แม้ว่าจะไม่ต้องใช้ jQuery โดยตรง แต่ DataTables ยังต้องการ
3. **Learning Curve** - ต้องเรียนรู้ API ของ DataTables

---

## การใช้งาน

### ในหน้า Product Page

```typescript
import DataTable from "@/components/ui/DataTable";

export default async function Page() {
  const products = await getProducts();

  return (
    <>
      <h3>Product</h3>
      <DataTable initialProducts={products} />
    </>
  );
}
```

---

## การทดสอบ

### Development
```bash
npm run dev
```

เปิด browser ที่ `http://localhost:3000/product` และทดสอบ:
- ✅ การค้นหา
- ✅ การเรียงลำดับ
- ✅ Pagination
- ✅ การลบข้อมูล
- ✅ Responsive design

### Production Build
```bash
npm run build
npm start
```

---

## Troubleshooting

### ปัญหา: ตารางไม่แสดง
**วิธีแก้:**
- ตรวจสอบว่า CSS ถูก import ใน `globals.css`
- ตรวจสอบ browser console หา error
- ตรวจสอบว่า `initialProducts` มีข้อมูล

### ปัญหา: Styles ไม่ถูกต้อง
**วิธีแก้:**
- Clear cache และ rebuild
- ตรวจสอบ Tailwind configuration
- ตรวจสอบ CSS import order

### ปัญหา: Delete ไม่ทำงาน
**วิธีแก้:**
- ตรวจสอบ API endpoint `/api/v1/products/:id`
- ตรวจสอบ event listener ใน `drawCallback`
- ตรวจสอบ permission ในการลบ

---

## Resources

- [DataTables.net Documentation](https://datatables.net)
- [DataTables.net API Reference](https://datatables.net/reference/api/)
- [DataTables.net Examples](https://datatables.net/examples/)
- [Responsive Extension](https://datatables.net/extensions/responsive/)
- [Buttons Extension](https://datatables.net/extensions/buttons/)

---

## Changelog

### [2025-10-28] - การอัปเดตครั้งใหญ่
- เปลี่ยนจาก Custom DataTable เป็น DataTables.net
- เพิ่ม responsive design
- เพิ่ม advanced filtering และ sorting
- ปรับปรุง UI/UX
- เพิ่ม documentation

---

## ผู้พัฒนา

- **Claude** - AI Assistant
- **Project**: PKM Shop
- **Date**: October 28, 2025
