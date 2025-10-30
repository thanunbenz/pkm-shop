import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// Create - สร้างสินค้าใหม่
export const createProduct = async (product: Prisma.ProductCreateInput) => {
    const newProduct = await prisma.product.create({
        data: product,
    });
    return newProduct;
};

// Read - ดึงข้อมูลสินค้าทั้งหมด
export const getProducts = async () => {
    const products = await prisma.product.findMany({
        include: {
            code: true,
        },
    });
    return products;

};

// Read - ดึงข้อมูลสินค้าตาม ID
export const getProductById = async (id: string) => {
        return await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                code: true,
            },
        });
    }
// Update - อัพเดทข้อมูลสินค้า
export const updateProduct = async (id: string, product: Prisma.ProductUpdateInput) => {
    const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: product,
    });
    return updatedProduct;
};

// Delete - ลบข้อมูลสินค้า
export const deleteProduct = async (id: string) => {
    const deletedProduct = await prisma.product.delete({
        where: { id: parseInt(id) },
    });
    return deletedProduct;
};

// Read - นับจำนวนสินค้าทั้งหมด
export const getCountProduct = async () => {
    const count = await prisma.product.count();
    return count;
};
