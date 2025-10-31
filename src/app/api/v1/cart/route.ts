import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

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

    // Validate and parse integers
    const userIdNum = parseInt(userId);
    const productIdNum = parseInt(productId);
    const quantityNum = parseInt(quantity);

    if (isNaN(userIdNum) || isNaN(productIdNum) || isNaN(quantityNum)) {
      return NextResponse.json(
        { error: "Invalid ID or quantity format" },
        { status: 400 }
      );
    }

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      if (session.user.id !== userIdNum) {
        return NextResponse.json(
          { error: "Unauthorized: You can only modify your own cart" },
          { status: 403 }
        );
      }
    }

    if (quantityNum <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
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

    // Validate and parse integers
    const userIdNum = parseInt(userId);
    const productIdNum = parseInt(productId);
    const quantityNum = parseInt(quantity);

    if (isNaN(userIdNum) || isNaN(productIdNum) || isNaN(quantityNum)) {
      return NextResponse.json(
        { error: "Invalid ID or quantity format" },
        { status: 400 }
      );
    }

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      if (session.user.id !== userIdNum) {
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

    // Validate and parse integers
    const userIdNum = parseInt(userId);
    const productIdNum = parseInt(productId);

    if (isNaN(userIdNum) || isNaN(productIdNum)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Authorization check: Verify userId matches session
    if (session && session.user && session.user.id) {
      if (session.user.id !== userIdNum) {
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
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
