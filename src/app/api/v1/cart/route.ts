import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId and productId are required" },
        { status: 400 }
      );
    }

    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(productId),
        },
      },
    });

    if (existingCartItem) {
      // Update quantity
      const updated = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + (quantity || 1),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create new cart item
      const created = await prisma.cart.create({
        data: {
          userId: parseInt(userId),
          productId: parseInt(productId),
          quantity: quantity || 1,
        },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity } = body;

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json(
        { error: "userId, productId, and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Delete if quantity is 0 or less
      await prisma.cart.delete({
        where: {
          userId_productId: {
            userId: parseInt(userId),
            productId: parseInt(productId),
          },
        },
      });
      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
      });
    }

    const updated = await prisma.cart.update({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(productId),
        },
      },
      data: { quantity: parseInt(quantity) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId and productId are required" },
        { status: 400 }
      );
    }

    await prisma.cart.delete({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(productId),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
