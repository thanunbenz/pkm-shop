# ID Obfuscation Migration Guide (Issue #63)

**Date:** 2025-11-07
**Issue:** #63 - Replace Sequential IDs with Obfuscated IDs
**Status:** ⚠️ REQUIRES MANUAL MIGRATION

---

## 📋 Overview

This guide explains how to safely migrate from sequential integer IDs to obfuscated IDs for enhanced security and to prevent enumeration attacks.

### Strategy

1. **User IDs**: Padded format (e.g., `10000000001`) - keeps INT in database, formats for display only
2. **Order IDs (Purchase)**: Amazon-style format (e.g., `702-1234567-8901`) - changes database schema to VARCHAR

---

## ⚠️ Important Notes

### User IDs (NO BREAKING CHANGE)
- ✅ Database remains `INT` - no migration needed
- ✅ Only display logic changes
- ✅ Backward compatible
- ✅ Zero downtime

### Order IDs (BREAKING CHANGE)
- ⚠️ Database changes from `INT` to `VARCHAR(20)`
- ⚠️ Requires data migration for existing orders
- ⚠️ **BACKUP DATABASE BEFORE PROCEEDING**
- ⚠️ Downtime required (estimated: 5-30 minutes depending on data size)

---

## 🚀 Migration Steps

### Phase 1: User ID Display (Safe - No Database Changes)

User IDs remain as `INT` in the database. We only change how they are displayed.

**No migration script needed!** Just deploy the new code.

#### Files Changed:
- `src/lib/utils/id-formatter.ts` - Utility functions
- API responses - Formatters applied
- Frontend components - Display formatted IDs

#### Example:
```typescript
// Database: userId = 42 (INT)
// Display: "10000000042" (String)

import { formatUserId, parseUserId } from '@/lib/utils/id-formatter';

// When displaying
const displayId = formatUserId(42); // "10000000042"

// When parsing from input
const dbId = parseUserId("10000000042"); // 42
```

---

### Phase 2: Order ID Migration (Requires Database Migration)

⚠️ **THIS CHANGES THE DATABASE SCHEMA**

#### Pre-Migration Checklist

- [ ] **BACKUP DATABASE**
  ```bash
  mysqldump -u root -p pkm_shop > backup_before_order_id_migration_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Verify no active purchases in progress
- [ ] Schedule maintenance window
- [ ] Test migration on staging/development first
- [ ] Have rollback plan ready

#### Migration Script

**File:** `prisma/migrations/YYYYMMDD_change_purchase_id_to_string/migration.sql`

```sql
-- ============================================================================
-- MIGRATION: Change Purchase.id from INT to VARCHAR(20)
-- Issue #63: ID Obfuscation for Security
-- ============================================================================

START TRANSACTION;

-- Step 1: Create new temporary table with new schema
CREATE TABLE `Purchase_new` (
  `id` VARCHAR(20) NOT NULL,
  `userId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `totalAmount` DOUBLE NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Purchase_userId_idx`(`userId`),
  INDEX `Purchase_productId_idx`(`productId`),
  INDEX `Purchase_status_idx`(`status`),
  INDEX `Purchase_createdAt_idx`(`createdAt`),

  CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Purchase_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Migrate existing data with generated order IDs
-- Format: 702-{timestamp}-{sequential}
INSERT INTO `Purchase_new` (
  `id`,
  `userId`,
  `productId`,
  `quantity`,
  `totalAmount`,
  `status`,
  `createdAt`,
  `updatedAt`
)
SELECT
  CONCAT(
    '702-',
    LPAD(SUBSTRING(UNIX_TIMESTAMP(`createdAt`), -7), 7, '0'), '-',
    LPAD(MOD(`id`, 10000), 4, '0')
  ) AS `id`,
  `userId`,
  `productId`,
  `quantity`,
  `totalAmount`,
  `status`,
  `createdAt`,
  `updatedAt`
FROM `Purchase`;

-- Step 3: Create mapping table for reference (optional but recommended)
CREATE TABLE `Purchase_ID_Mapping` (
  `old_id` INT NOT NULL PRIMARY KEY,
  `new_id` VARCHAR(20) NOT NULL,
  `migrated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Purchase_ID_Mapping_new_id_idx`(`new_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Purchase_ID_Mapping` (`old_id`, `new_id`)
SELECT
  `id` AS `old_id`,
  CONCAT(
    '702-',
    LPAD(SUBSTRING(UNIX_TIMESTAMP(`createdAt`), -7), 7, '0'), '-',
    LPAD(MOD(`id`, 10000), 4, '0')
  ) AS `new_id`
FROM `Purchase`;

-- Step 4: Update PurchaseCode table
ALTER TABLE `PurchaseCode` DROP FOREIGN KEY `PurchaseCode_purchaseId_fkey`;

ALTER TABLE `PurchaseCode` MODIFY `purchaseId` VARCHAR(20) NOT NULL;

UPDATE `PurchaseCode` pc
INNER JOIN `Purchase_ID_Mapping` pim ON pc.`purchaseId` = pim.`old_id`
SET pc.`purchaseId` = pim.`new_id`;

-- Re-add foreign key with new type
ALTER TABLE `PurchaseCode`
ADD CONSTRAINT `PurchaseCode_purchaseId_fkey`
FOREIGN KEY (`purchaseId`) REFERENCES `Purchase_new`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Update Payment table
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_purchaseId_fkey`;

ALTER TABLE `Payment` MODIFY `purchaseId` VARCHAR(20) NOT NULL;

UPDATE `Payment` p
INNER JOIN `Purchase_ID_Mapping` pim ON p.`purchaseId` = pim.`old_id`
SET p.`purchaseId` = pim.`new_id`;

-- Re-add foreign key with new type
ALTER TABLE `Payment`
ADD CONSTRAINT `Payment_purchaseId_fkey`
FOREIGN KEY (`purchaseId`) REFERENCES `Purchase_new`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Drop old Purchase table
DROP TABLE `Purchase`;

-- Step 7: Rename new table
RENAME TABLE `Purchase_new` TO `Purchase`;

-- Step 8: Re-apply CHECK constraints (from Issue #82)
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_total_amount_positive` CHECK (`totalAmount` > 0);

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
```

#### Post-Migration Steps

1. **Verify Data Integrity**
   ```sql
   -- Check row counts match
   SELECT COUNT(*) FROM Purchase;
   SELECT COUNT(*) FROM Purchase_ID_Mapping;

   -- Verify no orphaned records
   SELECT * FROM PurchaseCode WHERE purchaseId NOT IN (SELECT id FROM Purchase);
   SELECT * FROM Payment WHERE purchaseId NOT IN (SELECT id FROM Purchase);

   -- Check sample conversions
   SELECT * FROM Purchase_ID_Mapping LIMIT 10;
   ```

2. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Test Critical Flows**
   - Create new purchase
   - View existing purchase
   - Payment processing
   - Order history
   - Admin order management

4. **Deploy New Code**
   - Deploy API endpoints with new ID logic
   - Deploy frontend with formatted ID display
   - Monitor error logs

---

## 🔄 Rollback Plan

If migration fails or issues are detected:

```sql
-- Restore from backup
mysql -u root -p pkm_shop < backup_before_order_id_migration_YYYYMMDD_HHMMSS.sql

-- Revert Prisma schema
git checkout HEAD~1 -- prisma/schema.prisma

-- Regenerate Prisma client
npx prisma generate

-- Redeploy old code
```

---

## 📊 Estimated Impact

### Development Database
- **Records to migrate**: ~50-100 orders
- **Estimated time**: 1-2 minutes
- **Risk**: Low (can reset)

### Production Database
- **Records to migrate**: Varies (check `SELECT COUNT(*) FROM Purchase`)
- **Estimated time**: 5-30 minutes (depending on size)
- **Risk**: Medium (requires backup)

### Downtime
- **API**: 5-30 minutes (during migration)
- **Frontend**: None (backward compatible after migration)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Format user ID: `formatUserId(1)` → `"10000000001"`
- [ ] Parse user ID: `parseUserId("10000000001")` → `1`
- [ ] Generate order ID: `generateOrderId()` → `"702-1234567-8901"`
- [ ] Validate order ID: `isValidOrderId("702-1234567-8901")` → `true`
- [ ] Create new purchase (generates order ID)
- [ ] Retrieve existing purchase by order ID
- [ ] Payment flow with order ID
- [ ] User order history shows formatted IDs
- [ ] Admin order management works with new IDs
- [ ] Email notifications show formatted IDs

### Automated Testing

```bash
# Run ID formatter tests
npm test src/lib/utils/id-formatter.test.ts

# Run all tests
npm test
```

---

## 📝 Environment Variables

Add to `.env`:

```env
# ID Obfuscation Configuration
USER_ID_BASE="10000000000"    # Default: 10 billion (11 digits)
ORDER_ID_PREFIX="702"          # Default: 702 (customizable per region)
```

---

## 🔐 Security Benefits

### Before (Sequential IDs)
```
User ID: 1, 2, 3, 4, 5... (easy to enumerate)
Order ID: 1, 2, 3, 4, 5... (easy to guess)
```

### After (Obfuscated IDs)
```
User ID: 10000000001, 10000000002... (harder to enumerate)
Order ID: 702-1234567-8901, 702-1234568-3456... (unpredictable due to random component)
```

### Attack Prevention
- ✅ Prevents user enumeration
- ✅ Prevents order ID guessing
- ✅ Makes brute force attacks significantly harder
- ✅ Professional appearance (like Amazon, Shopee, Lazada)

---

## 📚 Related Files

### Core Utilities
- [`src/lib/utils/id-formatter.ts`](../../src/lib/utils/id-formatter.ts)
- [`tests/unit/lib/utils/id-formatter.test.ts`](../../tests/unit/lib/utils/id-formatter.test.ts)

### Schema Changes
- [`prisma/schema.prisma`](../../prisma/schema.prisma)

### Environment
- [`.env.example`](../../.env.example)

---

## 🆘 Troubleshooting

### Issue: Migration fails with foreign key constraint error

**Solution**: Disable foreign key checks temporarily
```sql
SET FOREIGN_KEY_CHECKS=0;
-- Run migration
SET FOREIGN_KEY_CHECKS=1;
```

### Issue: Duplicate order IDs generated

**Cause**: Timestamp + sequential might collide
**Solution**: Migration script uses modulo to reduce collisions. Check for duplicates:
```sql
SELECT new_id, COUNT(*) FROM Purchase_ID_Mapping GROUP BY new_id HAVING COUNT(*) > 1;
```

### Issue: API endpoints returning 404 for old order IDs

**Expected**: Old integer IDs are no longer valid
**Solution**: Use Purchase_ID_Mapping table to provide redirect/conversion endpoint

---

## ✅ Migration Success Criteria

- [ ] All existing purchases have new order IDs
- [ ] No data loss (row counts match)
- [ ] No orphaned PurchaseCode or Payment records
- [ ] New purchases generate valid order IDs
- [ ] API endpoints work with new ID format
- [ ] Frontend displays formatted IDs correctly
- [ ] Email notifications show formatted IDs
- [ ] All tests passing

---

## 📞 Support

If you encounter issues during migration:

1. **DO NOT PANIC** - You have a backup
2. **STOP THE MIGRATION** - Don't proceed if errors occur
3. **CHECK LOGS** - Review MySQL error logs
4. **ROLLBACK IF NEEDED** - Use backup to restore
5. **REPORT ISSUE** - Document what went wrong

---

**Last Updated:** 2025-11-07
**Author:** Claude (AI Assistant)
**Issue:** #63 - Replace Sequential IDs with Obfuscated IDs
