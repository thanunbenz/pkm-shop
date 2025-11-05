import { z } from "zod";
import { FILE_LIMITS } from "@/config/app-constants";

// File Upload Configuration (kept for backward compatibility, uses centralized constants)
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: FILE_LIMITS.MAX_SIZE,
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif", // Note: GIF not in centralized FILE_LIMITS (add if needed)
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
