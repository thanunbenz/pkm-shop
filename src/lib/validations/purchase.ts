import { z } from "zod";

// Purchase Create Schema (from cart checkout)
export const purchaseCreateSchema = z.object({
  userId: z
    .number({ message: "User ID must be a number" })
    .int("User ID must be an integer")
    .positive("User ID must be positive"),

  items: z
    .array(
      z.object({
        productId: z
          .number({ message: "Product ID must be a number" })
          .int("Product ID must be an integer")
          .positive("Product ID must be positive"),
        quantity: z
          .number({ message: "Quantity must be a number" })
          .int("Quantity must be an integer")
          .positive("Quantity must be positive")
          .max(100, "Quantity cannot exceed 100"),
      })
    )
    .min(1, "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ")
    .max(50, "สามารถสั่งซื้อได้สูงสุด 50 รายการต่อครั้ง"),

  paymentMethod: z
    .string()
    .min(1, "กรุณาเลือกวิธีการชำระเงิน")
    .default("manual"),

  paymentProof: z
    .string()
    .url("URL หลักฐานการชำระเงินไม่ถูกต้อง")
    .optional(),
});

// Purchase Status Update Schema (Admin only)
export const purchaseStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"], {
    message: "Status ต้องเป็น PENDING, COMPLETED, หรือ CANCELED",
  }),

  adminNotes: z
    .string()
    .max(1000, "หมายเหตุต้องไม่เกิน 1000 ตัวอักษร")
    .optional(),
});

// Payment Status Update Schema (Admin only)
export const paymentStatusUpdateSchema = z.object({
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED"], {
    message: "Payment status ต้องเป็น PENDING, SUCCESS, หรือ FAILED",
  }),

  adminNotes: z
    .string()
    .max(1000, "หมายเหตุต้องไม่เกิน 1000 ตัวอักษร")
    .optional(),

  transactionId: z
    .string()
    .max(200, "Transaction ID ต้องไม่เกิน 200 ตัวอักษร")
    .optional(),
});

// Purchase Query Schema
export const purchaseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val), 100) : 10)),

  status: z
    .enum(["PENDING", "COMPLETED", "CANCELED"])
    .optional(),

  userId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

// Type exports
export type PurchaseCreateInput = z.infer<typeof purchaseCreateSchema>;
export type PurchaseStatusUpdateInput = z.infer<typeof purchaseStatusUpdateSchema>;
export type PaymentStatusUpdateInput = z.infer<typeof paymentStatusUpdateSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
