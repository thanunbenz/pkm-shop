import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import logger from "@/lib/logger";

// GET - Get all codes from user's completed purchases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login to view your codes." },
        { status: 401 }
      );
    }

    const sessionUserId = parseInt(session.user.id);

    // Get all completed purchases with codes
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: sessionUserId,
        status: "COMPLETED", // Only show codes from completed purchases
        payment: {
          paymentStatus: "SUCCESS", // And payment must be successful
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
          },
        },
        purchaseCodes: {
          include: {
            code: {
              select: {
                id: true,
                code: true,
                isUsed: true,
              },
            },
          },
        },
        payment: {
          select: {
            paymentStatus: true,
            // paidAt: will be available after running migration
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to group codes by purchase
    const formattedPurchases = purchases.map((purchase: any) => ({
      purchaseId: purchase.id,
      productId: purchase.product.id,
      productName: purchase.product.name,
      productImage: purchase.product.image,
      productCategory: purchase.product.category,
      quantity: purchase.quantity,
      totalAmount: purchase.totalAmount,
      purchaseDate: purchase.createdAt,
      paidDate: (purchase.payment as any)?.paidAt || purchase.createdAt,
      codes: purchase.purchaseCodes.map((pc: any) => ({
        id: pc.code.id,
        code: pc.code.code,
        isUsed: pc.code.isUsed,
      })),
    }));

    // Also get summary statistics
    const totalPurchases = purchases.length;
    const totalCodes = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    return NextResponse.json({
      success: true,
      data: formattedPurchases,
      summary: {
        totalPurchases,
        totalCodes,
        totalSpent,
      },
    });
  } catch (error) {
    logger.error("Error fetching purchased codes:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch purchased codes" },
      { status: 500 }
    );
  }
}
