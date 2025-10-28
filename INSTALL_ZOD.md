# ⚠️ IMPORTANT: Install Zod

## Error ที่เกิด

```
[next-auth][error][CLIENT_FETCH_ERROR]
"The string did not match the expected pattern."
```

## สาเหตุ

ไฟล์ API routes ใช้ Zod validation แต่ Zod ยังไม่ได้ถูกติดตั้ง

## วิธีแก้ไข

### ขั้นตอนที่ 1: แก้ไข Permission

```bash
sudo chown -R $(whoami) /Users/sumbenz/Desktop/pkm-shop/node_modules
```

### ขั้นตอนที่ 2: ติดตั้ง Zod

```bash
npm install zod
```

### ขั้นตอนที่ 3: Restart Server

```bash
# กด Ctrl+C เพื่อหยุด server
# จากนั้นรันใหม่
npm run dev
```

## ตรวจสอบการติดตั้ง

```bash
grep "zod" package.json
```

ควรเห็น:
```json
"zod": "^3.x.x"
```

---

**Created:** 2025-10-28
**Status:** ⚠️ Action Required
