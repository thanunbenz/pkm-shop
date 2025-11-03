import { Product as PrismaProduct } from "@prisma/client";

// Re-export Product type
export type Product = PrismaProduct;

export type ProductWithoutTimestamps = Omit<Product, "createdAt" | "updatedAt">;

export type CreateProductInput = Omit<ProductWithoutTimestamps, "id">;

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductResponse = {
  data: Product[];
  message?: string;
  error?: string;
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: File;
}; 