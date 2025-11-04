-- Mock Order Data for PKM Shop
-- สร้างคำสั่งซื้อตัวอย่างเพื่อทดสอบ Order History และ Admin Orders

-- สมมติว่ามี:
-- - User ID = 2 (user ที่ login อยู่)
-- - Product ID = 51 (Scarlet & Violet Booster Pack)
-- - Codes ที่พร้อมใช้งาน

-- ====================================
-- 1. Order แรก: PENDING (รอการตรวจสอบ)
-- ====================================
INSERT INTO Purchase (userId, productId, quantity, totalAmount, status, createdAt, updatedAt)
VALUES (2, 51, 2, 298, 'PENDING', NOW(), NOW());

SET @purchase_id_1 = LAST_INSERT_ID();

-- สร้าง Payment record
INSERT INTO Payment (purchaseId, paymentMethod, paymentStatus, paymentProof, createdAt, updatedAt)
VALUES (
  @purchase_id_1,
  'manual',
  'PENDING',
  '/uploads/payment-proof-1.jpg',
  NOW(),
  NOW()
);

-- Reserve codes (ดึง 2 codes ที่ยังไม่ได้ใช้)
INSERT INTO PurchaseCode (purchaseId, codeId)
SELECT @purchase_id_1, id
FROM Code
WHERE productId = 51 AND isUsed = FALSE
LIMIT 2;

-- Mark codes as used
UPDATE Code
SET isUsed = TRUE
WHERE id IN (
  SELECT codeId FROM PurchaseCode WHERE purchaseId = @purchase_id_1
);

-- ====================================
-- 2. Order ที่สอง: COMPLETED (เสร็จสิ้น)
-- ====================================
INSERT INTO Purchase (userId, productId, quantity, totalAmount, status, createdAt, updatedAt)
VALUES (2, 52, 1, 149, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

SET @purchase_id_2 = LAST_INSERT_ID();

INSERT INTO Payment (purchaseId, paymentMethod, paymentStatus, paymentProof, paidAt, createdAt, updatedAt)
VALUES (
  @purchase_id_2,
  'manual',
  'SUCCESS',
  '/uploads/payment-proof-2.jpg',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  NOW()
);

INSERT INTO PurchaseCode (purchaseId, codeId)
SELECT @purchase_id_2, id
FROM Code
WHERE productId = 52 AND isUsed = FALSE
LIMIT 1;

UPDATE Code
SET isUsed = TRUE
WHERE id IN (
  SELECT codeId FROM PurchaseCode WHERE purchaseId = @purchase_id_2
);

-- ====================================
-- 3. Order ที่สาม: COMPLETED (อีกอันหนึ่ง)
-- ====================================
INSERT INTO Purchase (userId, productId, quantity, totalAmount, status, createdAt, updatedAt)
VALUES (2, 53, 2, 298, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW());

SET @purchase_id_3 = LAST_INSERT_ID();

INSERT INTO Payment (purchaseId, paymentMethod, paymentStatus, paymentProof, paidAt, createdAt, updatedAt)
VALUES (
  @purchase_id_3,
  'manual',
  'SUCCESS',
  '/uploads/payment-proof-3.jpg',
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  NOW()
);

INSERT INTO PurchaseCode (purchaseId, codeId)
SELECT @purchase_id_3, id
FROM Code
WHERE productId = 53 AND isUsed = FALSE
LIMIT 2;

UPDATE Code
SET isUsed = TRUE
WHERE id IN (
  SELECT codeId FROM PurchaseCode WHERE purchaseId = @purchase_id_3
);

-- ====================================
-- 4. Order ที่สี่: CANCELED (ถูกยกเลิก)
-- ====================================
INSERT INTO Purchase (userId, productId, quantity, totalAmount, status, createdAt, updatedAt)
VALUES (2, 54, 1, 169, 'CANCELED', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

SET @purchase_id_4 = LAST_INSERT_ID();

INSERT INTO Payment (purchaseId, paymentMethod, paymentStatus, paymentProof, adminNotes, createdAt, updatedAt)
VALUES (
  @purchase_id_4,
  'manual',
  'FAILED',
  '/uploads/payment-proof-4.jpg',
  'หลักฐานการโอนเงินไม่ชัดเจน',
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  NOW()
);

-- ไม่ต้อง reserve codes เพราะถูกยกเลิก

-- ====================================
-- 5. Order ที่ห้า: PENDING (อีกอันหนึ่ง)
-- ====================================
INSERT INTO Purchase (userId, productId, quantity, totalAmount, status, createdAt, updatedAt)
VALUES (2, 55, 2, 298, 'PENDING', DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW());

SET @purchase_id_5 = LAST_INSERT_ID();

INSERT INTO Payment (purchaseId, paymentMethod, paymentStatus, paymentProof, createdAt, updatedAt)
VALUES (
  @purchase_id_5,
  'manual',
  'PENDING',
  '/uploads/payment-proof-5.jpg',
  DATE_SUB(NOW(), INTERVAL 2 HOUR),
  NOW()
);

INSERT INTO PurchaseCode (purchaseId, codeId)
SELECT @purchase_id_5, id
FROM Code
WHERE productId = 55 AND isUsed = FALSE
LIMIT 2;

UPDATE Code
SET isUsed = TRUE
WHERE id IN (
  SELECT codeId FROM PurchaseCode WHERE purchaseId = @purchase_id_5
);

-- ====================================
-- สรุปผลลัพธ์
-- ====================================
SELECT
  p.id AS 'Order ID',
  pr.name AS 'Product',
  p.quantity AS 'จำนวน',
  p.totalAmount AS 'ยอดรวม',
  p.status AS 'สถานะ Order',
  pay.paymentStatus AS 'สถานะชำระเงิน',
  p.createdAt AS 'วันที่สั่งซื้อ',
  (SELECT COUNT(*) FROM PurchaseCode WHERE purchaseId = p.id) AS 'จำนวนโค้ด'
FROM Purchase p
LEFT JOIN Payment pay ON pay.purchaseId = p.id
LEFT JOIN Product pr ON pr.id = p.productId
WHERE p.userId = 2
ORDER BY p.createdAt DESC;
