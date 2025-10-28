import { z } from "zod";

// Common ID Schema
export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .positive("หน้าต้องเป็นจำนวนเต็มบวก")
    .default(1),

  limit: z
    .number()
    .int()
    .positive("จำนวนต้องเป็นจำนวนเต็มบวก")
    .max(100, "จำนวนต้องไม่เกิน 100")
    .default(10),
});

// Search Schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "คำค้นหาต้องมีอย่างน้อย 1 ตัวอักษร")
    .max(100, "คำค้นหาต้องไม่เกิน 100 ตัวอักษร")
    .trim(),
});

// Sort Schema
export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Date Range Schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด",
    path: ["endDate"],
  }
);

// Email Schema
export const emailSchema = z.object({
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .toLowerCase()
    .trim(),
});

// Phone Schema (Thai format)
export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก")
    .trim(),
});

// Thai ID Card Schema
export const thaiIdSchema = z.object({
  idCard: z
    .string()
    .regex(/^[0-9]{13}$/, "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก")
    .refine((val) => {
      // Thai ID Card validation algorithm
      if (val.length !== 13) return false;
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(val.charAt(i)) * (13 - i);
      }
      const mod = sum % 11;
      const check = (11 - mod) % 10;
      return check === parseInt(val.charAt(12));
    }, "เลขบัตรประชาชนไม่ถูกต้อง"),
});

// URL Schema
export const urlSchema = z.object({
  url: z.string().url("รูปแบบ URL ไม่ถูกต้อง"),
});

// Slug Schema
export const slugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug ต้องไม่เกิน 200 ตัวอักษร")
    .regex(/^[a-z0-9-]+$/, "Slug ต้องเป็นตัวอักษรพิมพ์เล็ก ตัวเลข และ - เท่านั้น")
    .trim(),
});

// Color Hex Schema
export const colorSchema = z.object({
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "รูปแบบสีไม่ถูกต้อง (ต้องเป็น HEX)"),
});

// Type exports
export type IdInput = z.infer<typeof idSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type ThaiIdInput = z.infer<typeof thaiIdSchema>;
export type UrlInput = z.infer<typeof urlSchema>;
export type SlugInput = z.infer<typeof slugSchema>;
export type ColorInput = z.infer<typeof colorSchema>;
