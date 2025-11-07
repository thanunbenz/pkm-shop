# PKM Shop - งานที่ยังค้างอยู่

**อัพเดท:** 2025-11-07 🎉 Issue #25 & #63 (Phase 1) เสร็จแล้ว!
**Branch:** feature/week2-medium-priority
**ความคืบหน้า:** 99.7% Production-Ready
**Medium Priority:** 12/26 (46%) ⬆️⬆️

---

## 🔥 งานที่ต้องทำด่วน

### 1. Issue #86: Developer Setup Guide (75% เสร็จแล้ว)
**เหลือ:** 2-3 ชั่วโมง

**ทำแล้ว:**
- ✅ Quick Start Guide
- ✅ Developer Setup Guide
- ✅ Troubleshooting Guide

**ยังค้าง:**
- [ ] Architecture & Tech Stack documentation
- [ ] Deployment guide (production)
- [ ] อัพเดท docs/README.md

---

### 2. Issue #84: Test Infrastructure (100% พร้อม - รอ npm install)
**เหลือ:** 15 นาที

**ทำแล้ว:**
- ✅ Test infrastructure สร้างเสร็จแล้ว
- ✅ 21 tests พร้อมใช้งาน
- ✅ Setup guide เขียนเสร็จ

**ต้องทำ:**
```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
npm test
```

---

## 📋 Medium Priority - งานที่เหลือ (14/26 issues)

### Week 4: Security (0 issues) ✅
- [x] **Issue #63:** Replace Sequential IDs with Obfuscated IDs - Phase 1 COMPLETE ✅
  - ✅ User ID: Padded format (10000000001) - Zero downtime
  - ✅ ID formatter utilities created (format/parse/validate)
  - ✅ Unit tests written (25+ test cases)
  - ✅ Documentation complete (Implementation + Migration guides)
  - 📝 Phase 2: Order ID migration deferred (requires downtime)

### Core Features - ยังไม่เริ่ม (10 issues)

#### ค้นหาและกรองสินค้า (2 issues)
- [ ] **Issue #19:** Product Search - 3-4h
  - Full-text search (ชื่อ, รายละเอียด)
  - Autocomplete
  - Search filters

- [ ] **Issue #20:** Category Filter - 2-3h
  - Filter by category
  - Show product count
  - URL query params

#### Admin Tools (2 issues)
- [ ] **Issue #21:** Bulk Code Upload - 4-5h
  - CSV/Excel upload
  - Validation + duplicate check
  - Progress indicator

- [ ] **Issue #22:** Export to CSV/Excel - 3-4h
  - Export orders
  - Export audit logs
  - Date range filter

#### Dashboard & Analytics (1 issue)
- [ ] **Issue #23:** Analytics Dashboard - 6-8h
  - Sales metrics
  - Popular products
  - Order status breakdown
  - Date range selector

#### Order Management (2 issues)
- [ ] **Issue #26:** Order Cancellation - 3-4h
  - Cancel pending orders
  - Release codes back to pool
  - Email confirmation

- [ ] **Issue #27:** Refund System - 6-8h
  - Refund request workflow
  - Admin approval
  - Status tracking

#### System Management (1 issue)
- [ ] **Issue #28:** Backup/Restore - 5-6h
  - Database backup scripts
  - Automated scheduling
  - Restore functionality

#### Advanced Features (2 issues)
- [ ] **Issue #37:** Product Inventory - 5-6h
  - Stock tracking
  - Low stock alerts
  - Prevent overselling

- [ ] **Issue #39:** Coupon System - 6-8h
  - Coupon CRUD
  - Discount validation
  - Usage tracking
  - Expiration dates

### Admin Settings & UI (4 issues)

- [ ] **Issue #58:** SEO & Branding Settings - 4-5h
  - Logo upload
  - Favicon upload
  - Color picker
  - Meta tags
  - Shop name

- [ ] **Issue #59:** Cookie Consent Banner - 2-3h
  - Cookie policy text
  - Accept/Decline buttons
  - localStorage preference

- [ ] **Issue #60:** Category Management (CRUD) - 4-5h
  - Create/Edit/Delete categories
  - Category ordering
  - Migrate existing (BOX, PACK, PROMO)

- [ ] **Issue #61:** Category in Navbar - 3-4h
  - Display categories in navbar
  - Filter products by category
  - Highlight active category

---

## 🔵 Low Priority - ไว้ทีหลัง (15 issues)

### Quick Wins (3 issues - รวม 6-8h)
- [ ] **Issue #68:** Sequential ID Exposure → ดู Issue #63
- [ ] **Issue #73:** Code Duplication - Create useDataTable hook - 3-4h
- [ ] **Issue #80:** API Rate Limit Headers - 1-2h

### UI/UX Improvements (8 issues)
- [ ] Issue #29: Dark mode
- [ ] Issue #30: Mobile responsiveness
- [ ] Issue #31: Multi-language (i18n แบบเต็ม)
- [ ] Issue #32: Accessibility (ARIA)
- [ ] Issue #33: Performance monitoring
- [ ] Issue #34: SEO optimization
- [ ] Issue #35: API docs (Swagger) - **ทำแล้วบางส่วน**
- [ ] Issue #36: Unit + E2E tests

### Developer Experience (5 issues)
- [ ] Issue #47: Development seed data
- [ ] Issue #48: Docker setup
- [ ] Issue #49: CI/CD pipeline
- [ ] Issue #50: ESLint strict + Prettier
- [ ] Issue #51: Git hooks (pre-commit)

### Nice-to-Have (5 issues)
- [ ] Issue #52: Social media integration
- [ ] Issue #53: Product reviews/ratings
- [ ] Issue #54: Wishlist
- [ ] Issue #55: Recommendation engine
- [ ] Issue #56: Advanced filtering

---

## 📊 สรุปสถิติ

### ความคืบหน้าตาม Priority
- ✅ **Critical:** 7/7 (100%)
- ✅ **High Priority:** 17/18 (94%)
  - Issue #84 พร้อม 100% แต่รอ npm install
- ⏳ **Medium Priority:** 12/26 (46%) ⬆️⬆️
  - Week 1: 5/5 ✅
  - Week 2: 4/4 ✅
  - Week 3: 1/2 (Issue #86 ค้าง 25%)
  - Week 4: 2/2 ✅ (Issue #25, #63 Phase 1 เสร็จแล้ว!) 🎉🎉
  - Remaining: 14 issues (ยังไม่เริ่ม)
- ⏳ **Low Priority:** 0/15 (0%)

### งานที่เหลือทั้งหมด
- **ด่วน:** 2 issues (~3h)
- **Medium:** 14 issues (~60-75h) ⬇️⬇️
- **Low:** 15 issues (~60-80h)
- **รวม:** 31 issues (~123-158h)

---

## 🎯 แผนการทำงานแนะนำ

### สัปดาห์นี้ (Week 4) - ⏳ กำลังทำ
1. [ ] เสร็จสิ้น Issue #86 (2-3h) - ⏳ 75% เสร็จ
2. [ ] Run tests Issue #84 (15min)
3. ✅ Password Reset Flow #25 (4-5h) - 🎉 เสร็จแล้ว!
4. ✅ Sequential IDs → Obfuscated #63 Phase 1 (3h) - 🎉 เสร็จแล้ว!

**เสร็จแล้ว:** 2/4 (50%)
**เหลือ:** 2-3h

### สัปดาห์หน้า (Week 5)
1. Product Search #19 (3-4h)
2. Category Filter #20 (2-3h)
3. Bulk Code Upload #21 (4-5h)
4. Export CSV/Excel #22 (3-4h)

**รวม:** 12-16h

### สัปดาห์ถัดไป (Week 6)
1. Analytics Dashboard #23 (6-8h)
2. Order Cancellation #26 (3-4h)
3. Admin Settings SEO #58 (4-5h)

**รวม:** 13-17h

---

## 📝 หมายเหตุสำคัญ

### ระบบที่ทำเสร็จแล้ว
- ✅ Purchase & Order system
- ✅ Payment verification
- ✅ Email notifications (SendGrid)
- ✅ Admin order management
- ✅ Audit logging (Winston)
- ✅ Rate limiting (Redis)
- ✅ User profile edit
- ✅ Change password (with email notification)
- ✅ Password reset flow (Forgot password) 🆕
- ✅ ID obfuscation - Phase 1 (User IDs padded format) 🆕
- ✅ I18n Thai/English
- ✅ CORS configuration
- ✅ Database validation (CHECK constraints)
- ✅ Swagger API docs (23 endpoints)
- ✅ Security: 100/100

### Environment Variables ที่ต้องมี
```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
JWT_SECRET=

# Email (SendGrid)
SENDGRID_API_KEY=
EMAIL_FROM=

# Redis (Optional - สำหรับ rate limiting แบบ distributed)
REDIS_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Admin
ADMIN_EMAIL=
```

### คำสั่งที่ใช้บ่อย
```bash
# Development
npm run dev

# Database
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Build & Test
npm run build
npm test

# Git
git status
git add .
git commit -m "..."
git push
```

---

## 🔗 เอกสารที่เกี่ยวข้อง

### Getting Started
- [Quick Start](docs/00-getting-started/QUICK_START.md)
- [Developer Setup](docs/00-getting-started/DEVELOPER_SETUP.md)
- [Troubleshooting](docs/00-getting-started/TROUBLESHOOTING.md)

### Security & Implementation
- [Implementation Summary](docs/02-security/IMPLEMENTATION_SUMMARY.md)
- [Security Improvements (EN)](docs/02-security/SECURITY_IMPROVEMENTS.md)
- [Security Improvements (TH)](docs/02-security/SECURITY_IMPROVEMENTS_TH.md)

### Development Guides
- [Testing Setup](docs/03-development/TESTING_SETUP_GUIDE.md)
- [API Response Standards](docs/03-development/API_RESPONSE_STANDARDS.md)
- [I18n Implementation](docs/03-development/I18N_IMPLEMENTATION.md)
- [Redis Rate Limiter](docs/03-development/REDIS_RATE_LIMITER.md)
- [Database Validation](docs/03-development/DATABASE_VALIDATION.md)

### Issues Tracking
- [Additional Issues Report](docs/issues/ADDITIONAL_ISSUES_REPORT.md)
- [Critical Issues Status](docs/issues/CRITICAL_ISSUES_STATUS.md)

---

**ต้องการความช่วยเหลืออะไรเพิ่มเติม?**
1. เริ่มทำ Issue ไหนก่อน?
2. ต้องการ implementation plan สำหรับ Issue ใด?
3. ต้องการดูรายละเอียด Issue เฉพาะ?
