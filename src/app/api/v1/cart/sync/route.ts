import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

interface CartItem {
  productId: number;
  quantity: number;
}

// POST - Sync local cart to server when user logs in
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, items } = body as { userId: number; items: CartItem[] };

    if (!userId || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Authorization check: Must be logged in and userId must match session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required to sync cart" },
        { status: 401 }
      );
    }

    if (session.user.id !== userId.toString()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only sync your own cart" },
        { status: 403 }
      );
    }

    // Use transaction to prevent race conditions and ensure data consistency
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Validate stock availability
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            code: {
              where: { isUsed: false },
            },
          },
        });

        if (!product) {
          throw new Error(`ไม่พบสินค้า ID ${item.productId}`);
        }

        const availableStock = product.code.length;

        // Check existing cart item
        const existingCartItem = await tx.cart.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: item.productId,
            },
          },
        });

        const newQuantity = existingCartItem
          ? existingCartItem.quantity + item.quantity
          : item.quantity;

        // Validate stock before adding/updating
        if (newQuantity > availableStock) {
          throw new Error(
            `สต็อกไม่เพียงพอสำหรับสินค้า "${product.name}" (เหลือ ${availableStock} ชิ้น)`
          );
        }

        // Upsert cart item (atomic operation)
        await tx.cart.upsert({
          where: {
            userId_productId: {
              userId,
              productId: item.productId,
            },
          },
          create: {
            userId,
            productId: item.productId,
            quantity: item.quantity,
          },
          update: {
            quantity: newQuantity,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cart synced successfully",
    });
  } catch (error) {
    console.error("Error syncing cart:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to sync cart";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 400 }
    );
  }
}
