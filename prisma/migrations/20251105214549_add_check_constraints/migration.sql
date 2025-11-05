-- Add CHECK constraints for data validation (Issue #82)
-- MySQL 8.0.16+ supports CHECK constraints
-- These constraints ensure data integrity at the database level

-- Product table: price must be positive, discountprice cannot be negative
ALTER TABLE `Product` ADD CONSTRAINT `product_price_positive` CHECK (`price` > 0);
ALTER TABLE `Product` ADD CONSTRAINT `product_discount_non_negative` CHECK (`discountprice` >= 0);

-- File table: size must be positive
ALTER TABLE `File` ADD CONSTRAINT `file_size_positive` CHECK (`size` > 0);

-- Purchase table: quantity and totalAmount must be positive
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `Purchase` ADD CONSTRAINT `purchase_total_positive` CHECK (`totalAmount` > 0);

-- Cart table: quantity must be positive
ALTER TABLE `Cart` ADD CONSTRAINT `cart_quantity_positive` CHECK (`quantity` > 0);

-- Banner table: order cannot be negative
ALTER TABLE `Banner` ADD CONSTRAINT `banner_order_non_negative` CHECK (`order` >= 0);
