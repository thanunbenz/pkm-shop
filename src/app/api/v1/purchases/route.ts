import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { purchaseCreateSchema, purchaseQuerySchema } from "@/lib/validations/purchase";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { parseIntSafe } from "@/lib/utils/parse";
import { hasStaffAccess } from "@/lib/utils/auth-helpers";

// POST - Create purchase from cart (Checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login to checkout." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = purchaseCreateSchema.parse(body);
    const sessionUserId = parseInt(session.user.id);

    // ✅ Authorization: User can only create purchase for themselves
    if (sessionUserId !== validatedData.userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only create purchases for yourself" },
        { status: 403 }
      );
    }

    // ✅ Transaction: Create purchase, payment, assign codes, clear cart
    const result = await prisma.$transaction(async (tx) => {
      const purchases = [];

      // Create separate purchase for each product
      for (const item of validatedData.items) {
        // 1. Check product exists and get available codes
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            code: {
              where: { isUsed: false },
              take: item.quantity,
            },
          },
        });

        if (!product) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        const availableStock = await tx.code.count({
          where: {
            productId: item.productId,
            isUsed: false,
          },
        });

        if (availableStock < item.quantity) {
          throw new Error(
            `สต็อกไม่เพียงพอสำหรับ ${product.name} (มีเพียง ${availableStock} โค้ด)`
          );
        }

        // 2. Calculate total amount (use discount price if on sale)
        const unitPrice = product.issale ? product.discountprice : product.price;
        const totalAmount = unitPrice * item.quantity;

        // 3. Create purchase
        const purchase = await tx.purchase.create({
          data: {
            userId: validatedData.userId,
            productId: item.productId,
            quantity: item.quantity,
            totalAmount,
            status: "PENDING",
          },
        });

        // 4. Create payment record
        await tx.payment.create({
          data: {
            purchaseId: purchase.id,
            paymentMethod: validatedData.paymentMethod,
            paymentStatus: "PENDING",
            paymentProof: validatedData.paymentProof,
          } as any,
        });

        // 5. Reserve codes (mark as used and link to purchase)
        const codesToUse = product.code.slice(0, item.quantity);
        for (const code of codesToUse) {
          await tx.code.update({
            where: { id: code.id },
            data: { isUsed: true },
          });

          await tx.purchaseCode.create({
            data: {
              purchaseId: purchase.id,
              codeId: code.id,
            },
          });
        }

        purchases.push(purchase);
      }

      // 6. Clear user's cart
      await tx.cart.deleteMany({
        where: { userId: validatedData.userId },
      });

      return purchases;
    });

    logger.info("Purchase created successfully", {
      userId: validatedData.userId,
      purchaseIds: result.map((p) => p.id),
      itemCount: validatedData.items.length,
    });

    return NextResponse.json({
      success: true,
      message: "สั่งซื้อสำเร็จ รอการตรวจสอบการชำระเงิน",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "ข้อมูลไม่ถูกต้อง",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    logger.error("Error creating purchase:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create purchase",
      },
      { status: 500 }
    );
  }
}

// GET - Get purchases (User: own purchases, Admin: all purchases)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login to view purchases." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    const validatedQuery = purchaseQuerySchema.parse(queryParams);

    const isStaff = hasStaffAccess(session);
    const sessionUserId = parseInt(session.user.id);

    // Build where clause
    const where: any = {};

    // Regular users can only see their own purchases
    if (!isStaff) {
      where.userId = sessionUserId;
    } else if (validatedQuery.userId) {
      // Staff can filter by userId
      where.userId = validatedQuery.userId;
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    // Get total count
    const total = await prisma.purchase.count({ where });

    // Get purchases with pagination
    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
          },
        },
        payment: {
          select: {
            paymentMethod: true,
            paymentStatus: true,
            // paymentProof: will be available after running migration
            // paidAt: will be available after running migration
          },
        },
        purchaseCodes: {
          include: {
            code: {
              select: {
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    });

    return NextResponse.json({
      success: true,
      data: purchases,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    logger.error("Error fetching purchases:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
