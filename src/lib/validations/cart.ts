import { z } from "zod";

// Cart Add/Update Schema
export const cartAddSchema = z.object({
  userId: z
    .number({ message: "userId must be a number" })
    .int("userId must be an integer")
    .positive("userId must be positive"),

  productId: z
    .number({ message: "productId must be a number" })
    .int("productId must be an integer")
    .positive("productId must be positive"),

  quantity: z
    .number({ message: "quantity must be a number" })
    .int("quantity must be an integer")
    .positive("quantity must be positive")
    .max(100, "quantity cannot exceed 100"),
});

// Cart Update Schema
export const cartUpdateSchema = z.object({
  userId: z
    .number({ message: "userId must be a number" })
    .int("userId must be an integer")
    .positive("userId must be positive"),

  productId: z
    .number({ message: "productId must be a number" })
    .int("productId must be an integer")
    .positive("productId must be positive"),

  quantity: z
    .number({ message: "quantity must be a number" })
    .int("quantity must be an integer")
    .nonnegative("quantity must be non-negative")
    .max(100, "quantity cannot exceed 100"),
});

// Cart Remove Schema
export const cartRemoveSchema = z.object({
  userId: z
    .number({ message: "userId must be a number" })
    .int("userId must be an integer")
    .positive("userId must be positive"),

  productId: z
    .number({ message: "productId must be a number" })
    .int("productId must be an integer")
    .positive("productId must be positive"),
});

// Type exports
export type CartAddInput = z.infer<typeof cartAddSchema>;
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;
export type CartRemoveInput = z.infer<typeof cartRemoveSchema>;
