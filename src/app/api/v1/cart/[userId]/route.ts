import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get cart for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: userIdNum },
      include: {
        product: {
          include: {
            code: {
              select: {
                id: true,
                isUsed: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match CartItem interface
    const items = cartItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      discountprice: item.product.discountprice,
      issale: item.product.issale,
      image: item.product.image,
      quantity: item.quantity,
      availableStock: item.product.code.filter((c) => !c.isUsed).length,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// DELETE - Clear user's cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    await prisma.cart.deleteMany({
      where: { userId: userIdNum },
    });

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
