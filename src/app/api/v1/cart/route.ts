import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import logger from "@/lib/logger";
import { parseIntSafe, parsePositiveIntSafe } from "@/lib/utils/parse";

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, productId, quantity = 1 } = body;

    // Validate required fields
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId and productId are required" },
        { status: 400 }
      );
    }

    // Validate and parse integers safely
    const userIdNum = parseIntSafe(userId, "User ID");
    const productIdNum = parseIntSafe(productId, "Product ID");
    const quantityNum = parsePositiveIntSafe(quantity, "Quantity");

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      const sessionUserId = parseInt(session.user.id);
      if (sessionUserId !== userIdNum) {
        return NextResponse.json(
          { error: "Unauthorized: You can only modify your own cart" },
          { status: 403 }
        );
      }
    }


    // Check stock availability
    const product = await prisma.product.findUnique({
      where: { id: productIdNum },
      include: {
        code: {
          where: { isUsed: false },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const availableStock = product.code.length;

    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: userIdNum,
          productId: productIdNum,
        },
      },
    });

    const newTotalQuantity = existingCartItem
      ? existingCartItem.quantity + quantityNum
      : quantityNum;

    // Validate stock
    if (newTotalQuantity > availableStock) {
      return NextResponse.json(
        {
          error: "สต็อกไม่เพียงพอ",
          availableStock,
          requestedQuantity: newTotalQuantity,
        },
        { status: 400 }
      );
    }

    // Use upsert for atomic operation
    const cartItem = await prisma.cart.upsert({
      where: {
        userId_productId: {
          userId: userIdNum,
          productId: productIdNum,
        },
      },
      create: {
        userId: userIdNum,
        productId: productIdNum,
        quantity: quantityNum,
      },
      update: {
        quantity: newTotalQuantity,
      },
    });

    return NextResponse.json({ success: true, data: cartItem });
  } catch (error) {
    logger.error("Error adding to cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add to cart" },
      { status: error instanceof Error && error.message.includes("must be") ? 400 : 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, productId, quantity } = body;

    // Validate required fields
    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json(
        { error: "userId, productId, and quantity are required" },
        { status: 400 }
      );
    }

    // Validate and parse integers safely
    const userIdNum = parseIntSafe(userId, "User ID");
    const productIdNum = parseIntSafe(productId, "Product ID");
    const quantityNum = parseIntSafe(quantity, "Quantity");

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      const sessionUserId = parseInt(session.user.id);
      if (sessionUserId !== userIdNum) {
        return NextResponse.json(
          { error: "Unauthorized: You can only modify your own cart" },
          { status: 403 }
        );
      }
    }

    // Handle deletion
    if (quantityNum <= 0) {
      await prisma.cart.delete({
        where: {
          userId_productId: {
            userId: userIdNum,
            productId: productIdNum,
          },
        },
      });
      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
      });
    }

    // Validate stock
    const product = await prisma.product.findUnique({
      where: { id: productIdNum },
      include: {
        code: {
          where: { isUsed: false },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const availableStock = product.code.length;

    if (quantityNum > availableStock) {
      return NextResponse.json(
        {
          error: "สต็อกไม่เพียงพอ",
          availableStock,
          requestedQuantity: quantityNum,
        },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await prisma.cart.update({
      where: {
        userId_productId: {
          userId: userIdNum,
          productId: productIdNum,
        },
      },
      data: { quantity: quantityNum },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Error updating cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cart" },
      { status: error instanceof Error && error.message.includes("must be") ? 400 : 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, productId } = body;

    // Validate required fields
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId and productId are required" },
        { status: 400 }
      );
    }

    // Validate and parse integers safely
    const userIdNum = parseIntSafe(userId, "User ID");
    const productIdNum = parseIntSafe(productId, "Product ID");

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      const sessionUserId = parseInt(session.user.id);
      if (sessionUserId !== userIdNum) {
        return NextResponse.json(
          { error: "Unauthorized: You can only modify your own cart" },
          { status: 403 }
        );
      }
    }

    await prisma.cart.delete({
      where: {
        userId_productId: {
          userId: userIdNum,
          productId: productIdNum,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    logger.error("Error removing from cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove from cart" },
      { status: error instanceof Error && error.message.includes("must be") ? 400 : 500 }
    );
  }
}
