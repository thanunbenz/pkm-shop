# ID Type Inconsistencies Report

## Summary
This document outlines all ID type inconsistencies found in the PKM Shop Next.js codebase.

---

## CRITICAL ISSUE: User ID Type Mismatch

Prisma Schema defines User.id as Int (line 35):
  id Int @id @default(autoincrement())

But NextAuth Types define it as String (src/types/next-auth.d.ts lines 7, 24):
  id: string

This causes type mismatches throughout the authentication and cart management systems.

---

## Files with Inconsistencies

### 1. src/types/next-auth.d.ts (CRITICAL)
- Lines 7, 24: User.id and JWT.id defined as string
- Should be: number to match Prisma schema
- Impact: Every session.user.id comparison needs conversion

### 2. src/app/api/auth/[...nextauth]/authOptions.ts (WORKAROUND)
- Line 44: String(user.id) - converting Int to String
- Line 71: Number(user.id) - converting String back to Int
- These conversions are needed due to NextAuth mismatch

### 3. src/app/api/v1/cart/[userId]/route.ts (INCONSISTENT)
- Lines 14: parseInt(userId) - converts URL string to number
- Lines 25, 90: userIdNum.toString() - converts back to string for session comparison
- Problem: Unnecessary back-and-forth conversion

### 4. src/app/api/v1/cart/route.ts (INCONSISTENT)
- Lines 35, 151, 254: userIdNum.toString() comparisons
- Multiple places with string/number mismatch
- Lines 22-24: parseInt on userId, productId, quantity

### 5. src/app/api/v1/cart/sync/route.ts (INCONSISTENT)
- Line 16: Expects userId: number in request body
- Line 33: Compares to session.user.id (string) using .toString()

### 6. src/app/(main)/cart/page.tsx (TYPE MISMATCH)
- Line 18: Number(session.user.id) conversion
- Lines 31, 48: Passes session.user.id as string to API expecting number

### 7. src/app/(main)/products/[id]/page.tsx (TYPE MISMATCH)
- Line 100: Passes session.user.id as string to API expecting number

### 8. src/features/products/components/editProduct.tsx (INCONSISTENT)
- Line 25: Product interface defines id: string
- Should be: id: number (Prisma uses Int)
- Lines 117, 139: String(data.file.id) conversions

### 9. src/app/api/v1/upload/[id]/route.ts (PARTIAL INCONSISTENCY)
- Lines 58, 116, 130: parseInt(id) - correct conversion for File.id
- Lines 223, 231: String(existingFile.id) - storing Int as String in imageId
- Problem: Product.imageId stores File IDs as strings

### 10. src/features/products/services/productServices.ts (CORRECT)
- Lines 26, 35, 44: parseInt(id) - proper conversion
- Status: CORRECT - handles string params to Int queries

### 11. src/app/api/v1/products/[id]/route.ts (CORRECT)
- Lines 13-18: Validates string ID before conversion
- Status: CORRECT - proper validation and conversion

### 12. src/app/api/v1/codes/[id]/route.ts (CORRECT)
- Lines 24, 66: parseInt(id) with validation
- Status: CORRECT - proper validation and conversion

### 13. src/app/api/v1/banners/[id]/route.ts (CORRECT)
- Uses UUID string directly (Banner.id is String in Prisma)
- Status: CORRECT - Banner IDs are intentionally String/UUID

### 14. src/store/useCartStore.ts (CORRECT)
- Uses number types consistently for productId and userId
- Status: CORRECT

---

## ID Types by Model

User:        id is Int        → NextAuth exports as String (MISMATCH)
Product:     id is Int        → Some components use String (MISMATCH)
Code:        id is Int        → Properly converted
File:        id is Int        → Properly converted in routes, but stored as String in imageId
Banner:      id is String     → Correctly used as String (UUID)
RefreshToken: id is Int       → Properly handled

---

## Files Needing Fixes

Priority 1 (Critical):
- src/types/next-auth.d.ts (change id: string to id: number)
- src/app/api/auth/[...nextauth]/authOptions.ts (remove String() and Number() conversions)

Priority 2 (High):
- src/app/api/v1/cart/[userId]/route.ts (remove .toString() conversions)
- src/app/api/v1/cart/route.ts (remove .toString() conversions in 3 methods)
- src/app/api/v1/cart/sync/route.ts (remove .toString() conversion)
- src/features/products/components/editProduct.tsx (change id: string to id: number)

Priority 3 (Medium):
- src/app/(main)/cart/page.tsx (ensure userId type consistency)
- src/app/(main)/products/[id]/page.tsx (ensure userId type consistency)
- src/app/api/v1/upload/[id]/route.ts (resolve imageId type strategy)

---

## Recommended Solution

Change NextAuth types to match Prisma schema:

1. Update next-auth.d.ts:
   - Change: id: string → id: number (in User, Session, JWT interfaces)

2. Update authOptions.ts:
   - Line 44: Remove String() → return { id: user.id, ... }
   - Line 71: Remove Number() → await createRefreshToken(user.id)

3. Update all cart routes:
   - Remove .toString() conversions when comparing with session.user.id

4. Update components:
   - Remove Number() conversions on session.user.id
   - Update Product interface to use id: number

5. Review imageId handling:
   - Decide if File IDs should be stored as Int or String in Product.imageId

