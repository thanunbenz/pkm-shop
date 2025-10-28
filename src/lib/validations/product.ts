import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(3, "ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(200, "ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร")
    .trim(),

  description: z
    .string()
    .min(10, "คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(2000, "คำอธิบายต้องไม่เกิน 2000 ตัวอักษร")
    .trim(),

  price: z
    .number()
    .positive("ราคาต้องมากกว่า 0")
    .max(1000000, "ราคาต้องไม่เกิน 1,000,000")
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => !isNaN(val as number), "ราคาต้องเป็นตัวเลข"),

  discountprice: z
    .number()
    .nonnegative("ราคาลดต้องไม่ติดลบ")
    .max(1000000, "ราคาลดต้องไม่เกิน 1,000,000")
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => !isNaN(val as number), "ราคาลดต้องเป็นตัวเลข"),

  category: z
    .string()
    .min(2, "หมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "หมวดหมู่ต้องไม่เกิน 50 ตัวอักษร")
    .trim(),

  issale: z.boolean().default(false),

  isrecommend: z.boolean().default(false),

  image: z.string().optional(),
}).refine((data) => data.discountprice <= data.price, {
  message: "ราคาลดต้องไม่เกินราคาปกติ",
  path: ["discountprice"],
});

// Create Product Schema (with image upload)
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(200, "ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร")
    .trim(),

  description: z
    .string()
    .min(10, "คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(2000, "คำอธิบายต้องไม่เกิน 2000 ตัวอักษร")
    .trim(),

  price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "ราคาต้องเป็นตัวเลขที่มากกว่า 0"),

  discountprice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, "ราคาลดต้องเป็นตัวเลขที่ไม่ติดลบ"),

  category: z
    .string()
    .min(2, "หมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "หมวดหมู่ต้องไม่เกิน 50 ตัวอักษร")
    .trim(),

  issale: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .or(z.boolean()),

  isrecommend: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .or(z.boolean()),
}).refine(
  (data) => data.discountprice <= data.price,
  {
    message: "ราคาลดต้องไม่เกินราคาปกติ",
    path: ["discountprice"],
  }
);

// Update Product Schema
export const updateProductSchema = productSchema.partial();

// Product ID Schema
export const productIdSchema = z.object({
  id: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[a-zA-Z0-9-_]+$/, "Invalid product ID format"),
});

// Product Query Schema
export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .refine((val) => val > 0, "หน้าต้องมากกว่า 0"),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val > 0 && val <= 100, "จำนวนต้องอยู่ระหว่าง 1-100"),

  category: z.string().optional(),

  issale: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  isrecommend: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  search: z.string().optional(),

  sortBy: z
    .enum(["name", "price", "createdAt", "discountprice"])
    .optional()
    .default("createdAt"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports
export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdInput = z.infer<typeof productIdSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
