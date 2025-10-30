import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface CartItem {
  productId: number;
  quantity: number;
}

// POST - Sync local cart to server when user logs in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items } = body as { userId: number; items: CartItem[] };

    if (!userId || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Merge local cart with server cart
    for (const item of items) {
      const existingCartItem = await prisma.cart.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: item.productId,
          },
        },
      });

      if (existingCartItem) {
        // Update quantity (add local quantity to server quantity)
        await prisma.cart.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + item.quantity,
          },
        });
      } else {
        // Create new cart item
        await prisma.cart.create({
          data: {
            userId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart synced successfully",
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json(
      { error: "Failed to sync cart" },
      { status: 500 }
    );
  }
}
