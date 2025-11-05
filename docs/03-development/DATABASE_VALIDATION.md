# Database Validation Implementation (CHECK Constraints)

**Created:** 2025-11-05
**Issue:** #82 - Missing Database Validation - Add CHECK constraints
**Status:** ✅ Complete
**Version:** 1.0

---

## 📋 Overview

This document describes the database-level validation (CHECK constraints) implemented for PKM Shop to ensure data integrity at the database layer.

### Problem Solved

**Before:**
- Only application-level validation via Zod schemas
- No database-level enforcement of business rules
- Possible data corruption from direct database access
- No prevention of invalid data from other sources

**After:**
- 7 CHECK constraints enforcing critical business rules
- Database-level validation preventing invalid data
- Defense-in-depth validation strategy (Zod + DB constraints)
- Protection against invalid data from any source

---

## 🏗️ Architecture

### Validation Layers

PKM Shop implements **defense-in-depth** validation with multiple layers:

1. **Client-side Validation** (Optional)
   - Form validation in React components
   - Immediate user feedback
   - UX improvement

2. **Application-level Validation** (Required)
   - Zod schemas in API routes
   - Type-safe validation
   - Detailed error messages

3. **Database-level Validation** (Required) ← **This implementation**
   - CHECK constraints in MySQL
   - Last line of defense
   - Prevents invalid data from any source

---

## 🗄️ Implemented CHECK Constraints

### 1. Product Table

```sql
ALTER TABLE `Product` ADD CONSTRAINT `product_price_positive`
  CHECK (`price` > 0);

ALTER TABLE `Product` ADD CONSTRAINT `product_discount_non_negative`
  CHECK (`discountprice` >= 0);
```

**Business Rules:**
- `price` must be positive (> 0) - cannot sell free or negative-priced products
- `discountprice` must be non-negative (>= 0) - can be 0 (no discount) but not negative

**Protected Against:**
- Accidentally setting price to 0 or negative values
- Invalid discount prices
- Data corruption from bulk imports

---

### 2. File Table

```sql
ALTER TABLE `File` ADD CONSTRAINT `file_size_positive`
  CHECK (`size` > 0);
```

**Business Rules:**
- `size` must be positive (> 0) - empty files (0 bytes) are invalid

**Protected Against:**
- Logging files that don't exist or failed to upload
- Data corruption in file metadata
- Zero-byte file references

---

### 3. Purchase Table

```sql
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_quantity_positive`
  CHECK (`quantity` > 0);

ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_total_positive`
  CHECK (`totalAmount` > 0);
```

**Business Rules:**
- `quantity` must be positive (> 0) - cannot purchase 0 or negative items
- `totalAmount` must be positive (> 0) - purchase must have a cost

**Protected Against:**
- Invalid purchase records with 0 quantity
- Free or negative-cost purchases
- Data corruption in order processing

---

### 4. Cart Table

```sql
ALTER TABLE `Cart` ADD CONSTRAINT `cart_quantity_positive`
  CHECK (`quantity` > 0);
```

**Business Rules:**
- `quantity` must be positive (> 0) - cannot have 0 or negative items in cart

**Protected Against:**
- Invalid cart entries
- Cart corruption from concurrent updates
- Edge cases in cart management

---

### 5. Banner Table

```sql
ALTER TABLE `Banner` ADD CONSTRAINT `banner_order_non_negative`
  CHECK (`order` >= 0);
```

**Business Rules:**
- `order` must be non-negative (>= 0) - display order starts from 0

**Protected Against:**
- Invalid negative display order
- Banner ordering corruption
- Accidental negative values

---

## 📂 File Structure

```
prisma/
├── schema.prisma                               # Schema with constraint comments
└── migrations/
    └── 20251105214549_add_check_constraints/
        └── migration.sql                       # Raw SQL migration

docs/
└── 03-development/
    └── DATABASE_VALIDATION.md                  # This file
```

---

## 🚀 Migration Process

### Step 1: Schema Documentation

Comments added to [prisma/schema.prisma](../../prisma/schema.prisma) to document constraints:

```prisma
model Product {
  id            Int           @id @default(autoincrement())
  name          String
  price         Float
  discountprice Float
  // ... other fields

  @@index([issale])
  @@index([isrecommend])
  // CHECK constraints added via migration (Issue #82)
  // - price > 0
  // - discountprice >= 0
}

model Purchase {
  // ... fields
  quantity      Int            @default(1)
  totalAmount   Float

  @@index([userId])
  @@index([productId])
  // CHECK constraints added via migration (Issue #82)
  // - quantity > 0
  // - totalAmount > 0
}

model Cart {
  // ... fields
  quantity  Int      @default(1)

  @@unique([userId, productId])
  // CHECK constraints added via migration (Issue #82)
  // - quantity > 0
}

model File {
  // ... fields
  size      Int

  // CHECK constraints added via migration (Issue #82)
  // - size > 0
}

model Banner {
  // ... fields
  order       Int      @default(0)

  @@index([isActive, order])
  // CHECK constraints added via migration (Issue #82)
  // - order >= 0
}
```

### Step 2: Raw SQL Migration

Created raw SQL migration because Prisma doesn't support `@@check()` syntax in schema:

**File:** `prisma/migrations/20251105214549_add_check_constraints/migration.sql`

```sql
-- Add CHECK constraints for data validation (Issue #82)
-- MySQL 8.0.16+ supports CHECK constraints

ALTER TABLE `Product` ADD CONSTRAINT `product_price_positive` CHECK (`price` > 0);
ALTER TABLE `Product` ADD CONSTRAINT `product_discount_non_negative` CHECK (`discountprice` >= 0);
ALTER TABLE `File` ADD CONSTRAINT `file_size_positive` CHECK (`size` > 0);
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_total_positive` CHECK (`totalAmount` > 0);
ALTER TABLE `Cart` ADD CONSTRAINT `cart_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `Banner` ADD CONSTRAINT `banner_order_non_negative` CHECK (`order` >= 0);
```

### Step 3: Apply Migration

```bash
# Apply migration to database
docker exec mysql_container mysql -u root -p[password] pkm_shop < \
  prisma/migrations/20251105214549_add_check_constraints/migration.sql

# Mark as applied in Prisma
npx prisma migrate resolve --applied 20251105214549_add_check_constraints
```

### Step 4: Verify Constraints

```bash
# Check constraints in database
docker exec mysql_container mysql -u root -p[password] -D information_schema -e \
  "SELECT CONSTRAINT_NAME, CHECK_CLAUSE
   FROM CHECK_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = 'pkm_shop'
   ORDER BY CONSTRAINT_NAME;"
```

**Expected Output:**
```
CONSTRAINT_NAME                   | CHECK_CLAUSE
----------------------------------+-----------------------------
banner_order_non_negative         | (`order` >= 0)
cart_quantity_positive            | (`quantity` > 0)
file_size_positive                | (`size` > 0)
product_discount_non_negative     | (`discountprice` >= 0)
product_price_positive            | (`price` > 0)
purchase_quantity_positive        | (`quantity` > 0)
purchase_total_positive           | (`totalAmount` > 0)
```

---

## 🧪 Testing

### Test 1: Invalid Product Price

```bash
# Try to insert product with negative price
docker exec mysql_container mysql -u root -p[password] pkm_shop -e \
  "INSERT INTO Product (name, price, discountprice, issale, isrecommend, category, updatedAt)
   VALUES ('Invalid Product', -100, 0, false, false, 'PACK', NOW());"
```

**Expected Result:**
```
ERROR 3819 (HY000): Check constraint 'product_price_positive' is violated.
```

✅ **Test passed!** Negative prices are rejected.

---

### Test 2: Invalid Cart Quantity

```bash
# Try to insert cart item with 0 quantity
docker exec mysql_container mysql -u root -p[password] pkm_shop -e \
  "INSERT INTO Cart (userId, productId, quantity, updatedAt)
   VALUES (1, 1, 0, NOW());"
```

**Expected Result:**
```
ERROR 3819 (HY000): Check constraint 'cart_quantity_positive' is violated.
```

✅ **Test passed!** Zero/negative quantities are rejected.

---

### Test 3: Valid Data Still Works

```bash
# Insert valid product
docker exec mysql_container mysql -u root -p[password] pkm_shop -e \
  "INSERT INTO Product (name, price, discountprice, issale, isrecommend, category, updatedAt)
   VALUES ('Valid Product', 100, 10, true, false, 'PACK', NOW());"
```

**Expected Result:**
```
Query OK, 1 row affected
```

✅ **Test passed!** Valid data is accepted.

---

## 🔒 Benefits

### 1. Data Integrity

**Before:**
```typescript
// Only application-level validation
const productSchema = z.object({
  price: z.number().positive(),
  discountprice: z.number().nonnegative(),
});

// But direct SQL can bypass this!
await prisma.$executeRaw`INSERT INTO Product (price) VALUES (-100)`;
```

**After:**
```typescript
// Both application AND database validation
const productSchema = z.object({
  price: z.number().positive(),  // Application layer ✅
  discountprice: z.number().nonnegative(),
});

// Database will reject this even if Zod is bypassed
await prisma.$executeRaw`INSERT INTO Product (price) VALUES (-100)`;
// ERROR 3819: Check constraint 'product_price_positive' is violated ✅
```

---

### 2. Defense in Depth

Multiple validation layers protect against different scenarios:

| Scenario | Client | Application (Zod) | Database (CHECK) |
|----------|--------|-------------------|------------------|
| User form input | ✅ | ✅ | ✅ |
| API direct call | ❌ | ✅ | ✅ |
| SQL injection | ❌ | ❌ | ✅ |
| Bulk import | ❌ | ❌ | ✅ |
| Direct DB access | ❌ | ❌ | ✅ |
| Migration scripts | ❌ | ❌ | ✅ |

---

### 3. Protection Against Edge Cases

**Scenario 1: Bulk Data Import**
```sql
-- Admin imports products from CSV
LOAD DATA INFILE 'products.csv' INTO TABLE Product;
-- ❌ Without CHECK constraints: invalid data could be imported
-- ✅ With CHECK constraints: invalid rows are rejected
```

**Scenario 2: Database Maintenance**
```sql
-- Update all prices during maintenance
UPDATE Product SET price = price * 0.9 WHERE category = 'PROMO';
-- ❌ Without CHECK constraints: could accidentally set price to 0 or negative
-- ✅ With CHECK constraints: invalid updates are rejected
```

**Scenario 3: Third-party Tools**
```
-- External reporting tool modifies data
-- ❌ Without CHECK constraints: no validation
-- ✅ With CHECK constraints: protected even from external tools
```

---

## 🐛 Troubleshooting

### Issue: Cannot Add Constraint (Existing Data Violates Rule)

**Error:**
```
ERROR 3819 (HY000): Check constraint 'product_price_positive' is violated.
```

**Cause:** Existing data in the table violates the constraint.

**Solution:**
```sql
-- Find invalid data
SELECT * FROM Product WHERE price <= 0 OR discountprice < 0;

-- Fix or delete invalid data
UPDATE Product SET price = 1 WHERE price <= 0;
DELETE FROM Product WHERE id IN (1, 2, 3); -- Delete if unfixable

-- Then apply constraint
ALTER TABLE Product ADD CONSTRAINT product_price_positive CHECK (price > 0);
```

---

### Issue: Constraint Already Exists

**Error:**
```
ERROR 3822 (HY000): Duplicate check constraint name 'product_price_positive'.
```

**Solution:**
```sql
-- Drop existing constraint
ALTER TABLE Product DROP CONSTRAINT product_price_positive;

-- Re-add with correct definition
ALTER TABLE Product ADD CONSTRAINT product_price_positive CHECK (price > 0);
```

---

### Issue: Migration Fails in Production

**Scenario:** Migration applied in development but fails in production due to existing invalid data.

**Solution:**
```sql
-- Step 1: Backup production data
mysqldump -u root -p pkm_shop > backup_before_constraints.sql

-- Step 2: Audit data for violations
SELECT 'Product price violations' as issue, COUNT(*) FROM Product WHERE price <= 0;
SELECT 'Product discount violations' as issue, COUNT(*) FROM Product WHERE discountprice < 0;
SELECT 'Purchase quantity violations' as issue, COUNT(*) FROM Purchase WHERE quantity <= 0;
SELECT 'Cart quantity violations' as issue, COUNT(*) FROM Cart WHERE quantity <= 0;

-- Step 3: Fix violations
UPDATE Product SET price = 1 WHERE price <= 0;
UPDATE Product SET discountprice = 0 WHERE discountprice < 0;
DELETE FROM Purchase WHERE quantity <= 0;
DELETE FROM Cart WHERE quantity <= 0;

-- Step 4: Apply constraints
-- Run migration.sql

-- Step 5: Verify
-- Check constraints query from above
```

---

## 📊 Constraint Summary

| Table | Constraint | Rule | Rationale |
|-------|-----------|------|-----------|
| Product | `product_price_positive` | `price > 0` | Products must have positive prices |
| Product | `product_discount_non_negative` | `discountprice >= 0` | Discounts can't be negative (0 = no discount) |
| File | `file_size_positive` | `size > 0` | Files must have content (no empty files) |
| Purchase | `purchase_quantity_positive` | `quantity > 0` | Must purchase at least 1 item |
| Purchase | `purchase_total_positive` | `totalAmount > 0` | Purchases must have a cost |
| Cart | `cart_quantity_positive` | `quantity > 0` | Cart items must have positive quantity |
| Banner | `banner_order_non_negative` | `order >= 0` | Display order starts from 0 |

**Total Constraints:** 7

---

## 🎯 Best Practices

### 1. Always Validate at Multiple Layers

**❌ Bad (Single layer):**
```typescript
// Only client-side validation
const handleSubmit = () => {
  if (price <= 0) {
    alert('Invalid price');
    return;
  }
  // Send to API without validation
  fetch('/api/products', { method: 'POST', body: JSON.stringify({ price }) });
};
```

**✅ Good (Multiple layers):**
```typescript
// Client-side validation
const handleSubmit = () => {
  if (price <= 0) {
    toast.error('Price must be positive');
    return;
  }

  // Send to API (will validate with Zod)
  fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({ price })
  });
};

// API validation (Zod)
const productSchema = z.object({
  price: z.number().positive(),
});

// Database validation (CHECK constraint)
// Automatically enforced by MySQL
```

---

### 2. Test Constraints After Adding

```bash
# Test script: test-constraints.sh
#!/bin/bash

echo "Testing product price constraint..."
docker exec mysql_container mysql -u root -p$DB_PASSWORD pkm_shop -e \
  "INSERT INTO Product (name, price, discountprice, issale, isrecommend, category, updatedAt)
   VALUES ('Test', -1, 0, false, false, 'PACK', NOW());" 2>&1 | grep -q "Check constraint" && \
  echo "✅ Price constraint working" || echo "❌ Price constraint failed"

echo "Testing cart quantity constraint..."
docker exec mysql_container mysql -u root -p$DB_PASSWORD pkm_shop -e \
  "INSERT INTO Cart (userId, productId, quantity, updatedAt) VALUES (1, 1, 0, NOW());" 2>&1 | \
  grep -q "Check constraint" && \
  echo "✅ Quantity constraint working" || echo "❌ Quantity constraint failed"

echo "All constraint tests complete!"
```

---

### 3. Document All Constraints

Always add comments to schema and maintain this documentation:

```prisma
// ✅ Good: Documented in schema
model Product {
  price Float
  discountprice Float

  // CHECK constraints added via migration (Issue #82)
  // - price > 0
  // - discountprice >= 0
}
```

---

### 4. Handle Constraint Violations Gracefully

```typescript
// API route handling constraint violations
try {
  await prisma.product.create({ data: productData });
} catch (error) {
  // MySQL CHECK constraint error code: 3819
  if (error.code === 'P2034' || error.message.includes('Check constraint')) {
    return errorResponseWithLang(
      'validation.failed',
      request.headers,
      400
    );
  }
  throw error;
}
```

---

## 🔄 Future Enhancements

### Potential Additional Constraints

1. **User Table**
   ```sql
   -- Email format validation (if MySQL supports regex)
   ALTER TABLE User ADD CONSTRAINT user_email_valid
     CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$');
   ```

2. **Payment Table**
   ```sql
   -- Payment status logic
   ALTER TABLE Payment ADD CONSTRAINT payment_status_logic
     CHECK (
       (paymentStatus = 'SUCCESS' AND paidAt IS NOT NULL) OR
       (paymentStatus != 'SUCCESS' AND paidAt IS NULL)
     );
   ```

3. **Purchase Table**
   ```sql
   -- Total must equal price * quantity
   ALTER TABLE Purchase ADD CONSTRAINT purchase_total_calc
     CHECK (totalAmount = quantity * (SELECT price FROM Product WHERE id = productId));
   -- Note: This requires subquery support which may have performance implications
   ```

4. **Product Table**
   ```sql
   -- Discount price <= regular price
   ALTER TABLE Product ADD CONSTRAINT product_discount_logic
     CHECK (discountprice <= price);
   ```

---

## 📚 Related Documentation

- [Prisma Schema](../../prisma/schema.prisma) - Database schema with constraint comments
- [API Response Standards](./API_RESPONSE_STANDARDS.md) - Issue #77
- [Validation Error Handling](./VALIDATION_ERROR.md) - Application-level validation
- [N+1 Query Prevention](./N+1_QUERY_PREVENTION.md) - Issue #74

---

## 🔗 Resources

- [MySQL 8.0 CHECK Constraints](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html)
- [Prisma Raw SQL](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
- [Defense in Depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing))

---

**Implementation Complete:** ✅
**Status:** Production Ready
**Issue:** #82 - Missing Database Validation
**MySQL Version Required:** 8.0.16+
**Constraints Added:** 7
**Last Updated:** 2025-11-05
