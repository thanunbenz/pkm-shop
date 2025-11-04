import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// Create - สร้างสินค้าใหม่
export const createProduct = async (product: Prisma.ProductCreateInput) => {
    const newProduct = await prisma.product.create({
        data: product,
    });
    return newProduct;
};

// Read - ดึงข้อมูลสินค้าทั้งหมด (with pagination and optimized code fetching)
export const getProducts = async (options?: {
    skip?: number;
    take?: number;
    includeAllCodes?: boolean;
}) => {
    const { skip = 0, take = 50, includeAllCodes = false } = options || {};

    const products = await prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: includeAllCodes ? {
            code: {
                select: {
                    id: true,
                    code: true,
                    isUsed: true,
                    createdAt: true,
                }
            }
        } : undefined,
        // If not including all codes, use _count for stock info
        ...(!includeAllCodes && {
            include: {
                _count: {
                    select: {
                        code: {
                            where: { isUsed: false }
                        }
                    }
                }
            }
        })
    });
    return products;
};

// Read - ดึงข้อมูลสินค้าตาม ID
export const getProductById = async (id: string, includeAllCodes: boolean = true) => {
    return await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
            code: includeAllCodes ? {
                orderBy: { createdAt: 'desc' }
            } : {
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    isUsed: true,
                    createdAt: true,
                }
            },
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
