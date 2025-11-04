import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import logger from "@/lib/logger";

// GET - Get cart for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login to view cart." },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // ✅ Authorization check: User can only view their own cart
    const sessionUserId = parseInt(session.user.id);
    if (sessionUserId !== userIdNum) {
      return NextResponse.json(
        { error: "Unauthorized: You can only view your own cart" },
        { status: 403 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: userIdNum },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountprice: true,
            issale: true,
            image: true,
            _count: {
              select: {
                code: {
                  where: { isUsed: false }
                }
              }
            }
          }
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
      availableStock: item.product._count.code,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    logger.error("Error fetching cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
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
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login to clear cart." },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // ✅ Authorization check: User can only clear their own cart
    const sessionUserId = parseInt(session.user.id);
    if (sessionUserId !== userIdNum) {
      return NextResponse.json(
        { error: "Unauthorized: You can only clear your own cart" },
        { status: 403 }
      );
    }

    await prisma.cart.deleteMany({
      where: { userId: userIdNum },
    });

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    logger.error("Error clearing cart:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
