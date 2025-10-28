# 🚀 Getting Started

เอกสารสำหรับการเริ่มต้นใช้งานโปรเจกต์

---

## 📚 เอกสารในหมวดนี้

### 1. [START_HERE.md](./START_HERE.md) ⭐
**เริ่มต้นที่นี่!**
- Quick start guide
- คำแนะนำรวดเร็ว 1 คำสั่ง
- Checklist การ setup

### 2. [SETUP_GUIDE.md](./SETUP_GUIDE.md)
**คู่มือติดตั้งแบบละเอียด**
- Step-by-step setup instructions
- Prerequisites
- Troubleshooting
- Database setup
- Environment configuration

### 3. [FIX_AND_RUN.sh](./FIX_AND_RUN.sh)
**Script รัน auto**
- Auto setup & install dependencies
- Fix npm permissions
- Generate Prisma Client
- Start development server

---

## ⚡ Quick Commands

### เริ่มต้นแบบเร็ว (Recommended)
```bash
cd pkm-shop
./docs/00-getting-started/FIX_AND_RUN.sh
```

### หรือติดตั้งแบบ Manual
```bash
# 1. Fix permissions
sudo chown -R $(whoami) ~/.npm

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npx prisma generate
npx prisma migrate dev

# 5. Start server
npm run dev
```

---

## 📋 Prerequisites

ก่อนเริ่มต้น ต้องมี:
- ✅ Node.js 18+
- ✅ MySQL 8.0+
- ✅ npm หรือ yarn

---

## 🆘 ต้องการความช่วยเหลือ?

- **ติดปัญหาการติดตั้ง:** ดู [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **ต้องการข้อมูลเพิ่มเติม:** กลับไปที่ [📚 Main Documentation](../README.md)
- **ปัญหา Security:** ดู [Security Documentation](../02-security/README.md)

---

**Last Updated:** 2025-10-28
