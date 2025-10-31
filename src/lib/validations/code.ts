import { z } from "zod";

// Code create validation
export const codeCreateSchema = z.object({
  code: z
    .string()
    .min(1, "กรุณาใส่โค้ด")
    .max(100, "โค้ดยาวเกินไป (สูงสุด 100 ตัวอักษร)")
    .regex(/^[A-Za-z0-9-_]+$/, "โค้ดต้องประกอบด้วยตัวอักษร ตัวเลข และ - _ เท่านั้น"),
  productId: z
    .number()
    .int("Product ID ต้องเป็นจำนวนเต็ม")
    .positive("Product ID ต้องเป็นจำนวนบวก"),
  isUsed: z
    .boolean()
    .default(false),
});

// Code update validation (whitelist fields)
export const codeUpdateSchema = z.object({
  code: z
    .string()
    .min(1, "กรุณาใส่โค้ด")
    .max(100, "โค้ดยาวเกินไป (สูงสุด 100 ตัวอักษร)")
    .regex(/^[A-Za-z0-9-_]+$/, "โค้ดต้องประกอบด้วยตัวอักษร ตัวเลข และ - _ เท่านั้น")
    .optional(),
  isUsed: z
    .boolean()
    .optional(),
  productId: z
    .number()
    .int("Product ID ต้องเป็นจำนวนเต็ม")
    .positive("Product ID ต้องเป็นจำนวนบวก")
    .optional(),
});

// Bulk code create validation
export const bulkCodeCreateSchema = z.object({
  codes: z
    .array(z.string().min(1, "โค้ดต้องไม่ว่าง"))
    .min(1, "กรุณาใส่โค้ดอย่างน้อย 1 รายการ")
    .max(1000, "สามารถเพิ่มโค้ดได้สูงสุด 1000 รายการต่อครั้ง"),
  productId: z
    .number()
    .int("Product ID ต้องเป็นจำนวนเต็ม")
    .positive("Product ID ต้องเป็นจำนวนบวก"),
});

export type CodeCreate = z.infer<typeof codeCreateSchema>;
export type CodeUpdate = z.infer<typeof codeUpdateSchema>;
export type BulkCodeCreate = z.infer<typeof bulkCodeCreateSchema>;
