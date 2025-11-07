-- ============================================================================
-- MIGRATION: Add Product Search Indexes (Issue #19)
-- Description: Add FULLTEXT index and regular indexes for product search
-- ============================================================================

-- Add FULLTEXT index for name and description search
-- This enables fast full-text search in MySQL
ALTER TABLE `Product` ADD FULLTEXT INDEX `product_search_idx` (`name`, `description`);

-- Add regular indexes for filtering and sorting
ALTER TABLE `Product` ADD INDEX `Product_price_idx` (`price`);
ALTER TABLE `Product` ADD INDEX `Product_createdAt_idx` (`createdAt`);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify indexes were created:

-- Check all indexes on Product table
SHOW INDEXES FROM `Product`;

-- Test FULLTEXT search
SELECT * FROM `Product`
WHERE MATCH(name, description) AGAINST('pokemon' IN NATURAL LANGUAGE MODE)
LIMIT 10;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- ALTER TABLE `Product` DROP INDEX `product_search_idx`;
-- ALTER TABLE `Product` DROP INDEX `Product_price_idx`;
-- ALTER TABLE `Product` DROP INDEX `Product_createdAt_idx`;
