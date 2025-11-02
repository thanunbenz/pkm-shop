import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import logger from "@/lib/logger";

interface CartItem {
  productId: number;
  quantity: number;
}

// POST - Sync local cart to server when user logs in
export async function POST(request: NextRequest) {
  let userId: number | undefined;

  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId: userIdFromBody, items } = body as { userId: number; items: CartItem[] };
    userId = userIdFromBody;

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

    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only sync your own cart" },
        { status: 403 }
      );
    }

    // Use transaction to prevent race conditions and ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Batch fetch all products and existing cart items to avoid N+1 queries
      const productIds = items.map(item => item.productId);

      const [products, existingCartItems] = await Promise.all([
        tx.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                code: {
                  where: { isUsed: false }
                }
              }
            }
          }
        }),
        tx.cart.findMany({
          where: {
            userId,
            productId: { in: productIds }
          }
        })
      ]);

      // Create maps for O(1) lookup
      const productMap = new Map(products.map(p => [p.id, p]));
      const cartMap = new Map(existingCartItems.map(c => [c.productId, c]));

      // Validate all items first
      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`ไม่พบสินค้า ID ${item.productId}`);
        }

        const availableStock = product._count.code;
        const existingCartItem = cartMap.get(item.productId);

        const newQuantity = existingCartItem
          ? existingCartItem.quantity + item.quantity
          : item.quantity;

        // Validate stock before adding/updating
        if (newQuantity > availableStock) {
          throw new Error(
            `สต็อกไม่เพียงพอสำหรับสินค้า "${product.name}" (เหลือ ${availableStock} ชิ้น)`
          );
        }
      }

      // Batch upsert all cart items
      await Promise.all(
        items.map(item => {
          const existingCartItem = cartMap.get(item.productId);
          const newQuantity = existingCartItem
            ? existingCartItem.quantity + item.quantity
            : item.quantity;

          return tx.cart.upsert({
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
        })
      );
    });

    return NextResponse.json({
      success: true,
      message: "Cart synced successfully",
    });
  } catch (error) {
    // Log error details server-side
    logger.error("Error syncing cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId: userId,
    });

    // Return generic error to client (don't expose internal details)
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
