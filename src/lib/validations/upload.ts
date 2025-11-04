import { z } from "zod";

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
} as const;

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file !== undefined, "กรุณาเลือกไฟล์")
    .refine(
      (file) => file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE,
      `ขนาดไฟล์ต้องไม่เกิน ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => (UPLOAD_CONFIG.ALLOWED_FILE_TYPES as readonly string[]).includes(file.type),
      `รองรับเฉพาะไฟล์ ${UPLOAD_CONFIG.ALLOWED_FILE_TYPES.join(", ")}`
    ),
});

// Multiple File Upload Schema
export const multipleFileUploadSchema = z.object({
  files: z
    .array(
      z
        .custom<File>()
        .refine(
          (file) => file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE,
          `ขนาดไฟล์ต้องไม่เกิน ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
        )
        .refine(
          (file) => (UPLOAD_CONFIG.ALLOWED_FILE_TYPES as readonly string[]).includes(file.type),
          `รองรับเฉพาะไฟล์ ${UPLOAD_CONFIG.ALLOWED_FILE_TYPES.join(", ")}`
        )
    )
    .min(1, "กรุณาเลือกอย่างน้อย 1 ไฟล์")
    .max(10, "อัปโหลดได้สูงสุด 10 ไฟล์"),
});

// Image Delete Schema
export const imageDeleteSchema = z.object({
  id: z.string().min(1, "Image ID is required"),
});

// MIME Type Validation
export const mimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Type exports
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type MultipleFileUploadInput = z.infer<typeof multipleFileUploadSchema>;
export type ImageDeleteInput = z.infer<typeof imageDeleteSchema>;
export type AllowedMimeType = z.infer<typeof mimeTypeSchema>;
