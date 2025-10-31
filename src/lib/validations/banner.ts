import { z } from "zod";

// Banner create validation
export const bannerCreateSchema = z.object({
  title: z
    .string()
    .min(1, "กรุณาใส่หัวข้อ")
    .max(200, "หัวข้อยาวเกินไป (สูงสุด 200 ตัวอักษร)"),
  description: z
    .string()
    .max(1000, "คำอธิบายยาวเกินไป (สูงสุด 1000 ตัวอักษร)")
    .optional()
    .nullable(),
  image: z
    .string()
    .min(1, "กรุณาเลือกรูปภาพ"),
  imageId: z
    .string()
    .optional()
    .nullable(),
  link: z
    .string()
    .url("URL ลิงก์ไม่ถูกต้อง")
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z
    .boolean()
    .default(true),
  order: z
    .number()
    .int("ลำดับต้องเป็นจำนวนเต็ม")
    .min(0, "ลำดับต้องไม่น้อยกว่า 0")
    .default(0),
});

// Banner update validation (all fields optional)
export const bannerUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "กรุณาใส่หัวข้อ")
    .max(200, "หัวข้อยาวเกินไป (สูงสุด 200 ตัวอักษร)")
    .optional(),
  description: z
    .string()
    .max(1000, "คำอธิบายยาวเกินไป (สูงสุด 1000 ตัวอักษร)")
    .optional()
    .nullable(),
  image: z
    .string()
    .min(1, "กรุณาเลือกรูปภาพ")
    .optional(),
  imageId: z
    .string()
    .optional()
    .nullable(),
  link: z
    .string()
    .url("URL ลิงก์ไม่ถูกต้อง")
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z
    .boolean()
    .optional(),
  order: z
    .number()
    .int("ลำดับต้องเป็นจำนวนเต็ม")
    .min(0, "ลำดับต้องไม่น้อยกว่า 0")
    .optional(),
});

export type BannerCreate = z.infer<typeof bannerCreateSchema>;
export type BannerUpdate = z.infer<typeof bannerUpdateSchema>;
