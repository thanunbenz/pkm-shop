import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { purchaseStatusUpdateSchema, paymentStatusUpdateSchema } from "@/lib/validations/purchase";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { parseIntSafe } from "@/lib/utils/parse";

// GET - Get purchase details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const purchaseId = parseIntSafe(id, "Purchase ID");

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            category: true,
          },
        },
        payment: true,
        purchaseCodes: {
          include: {
            code: {
              select: {
                code: true,
                isUsed: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: "Purchase not found" },
        { status: 404 }
      );
    }

    const sessionUserId = parseInt(session.user.id);
    const isStaff = hasStaffAccess(session);

    // ✅ Authorization: Users can only view their own purchases
    if (!isStaff && purchase.userId !== sessionUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only view your own purchases" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    logger.error("Error fetching purchase:", {
      error: error instanceof Error ? error.message : "Unknown error",
      purchaseId: (await params).id,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch purchase",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update purchase status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require STAFF access
    if (!hasStaffAccess(session)) {
      return NextResponse.json(
        { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
        { status: 401 }
      );
    }

    const { id } = await params;
    const purchaseId = parseIntSafe(id, "Purchase ID");
    const body = await request.json();

    // Determine which schema to use based on body content
    let validatedData: any;
    let updateType: "purchase" | "payment";

    if (body.status !== undefined) {
      validatedData = purchaseStatusUpdateSchema.parse(body);
      updateType = "purchase";
    } else if (body.paymentStatus !== undefined) {
      validatedData = paymentStatusUpdateSchema.parse(body);
      updateType = "payment";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid update data. Provide 'status' or 'paymentStatus'" },
        { status: 400 }
      );
    }

    // Get purchase to verify it exists
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { payment: true },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: "Purchase not found" },
        { status: 404 }
      );
    }

    let updatedData;

    if (updateType === "purchase") {
      // Update purchase status
      updatedData = await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: validatedData.status,
        },
        include: {
          payment: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update payment adminNotes if provided
      if (validatedData.adminNotes && purchase.payment) {
        await prisma.payment.update({
          where: { id: purchase.payment.id },
          data: {
            adminNotes: validatedData.adminNotes,
          } as any,
        });
      }

      logger.info("Purchase status updated", {
        purchaseId,
        oldStatus: purchase.status,
        newStatus: validatedData.status,
        updatedBy: session?.user?.email,
      });
    } else {
      // Update payment status
      if (!purchase.payment) {
        return NextResponse.json(
          { success: false, error: "Payment record not found" },
          { status: 404 }
        );
      }

      const paymentUpdate: any = {
        paymentStatus: validatedData.paymentStatus,
      };

      if (validatedData.adminNotes) {
        paymentUpdate.adminNotes = validatedData.adminNotes;
      }

      if (validatedData.transactionId) {
        paymentUpdate.transactionId = validatedData.transactionId;
      }

      // Set paidAt timestamp when payment is successful
      if (validatedData.paymentStatus === "SUCCESS" && !(purchase.payment as any).paidAt) {
        paymentUpdate.paidAt = new Date();
      }

      updatedData = await prisma.payment.update({
        where: { id: purchase.payment.id },
        data: paymentUpdate as any,
      });

      // Auto-complete purchase if payment is successful
      if (validatedData.paymentStatus === "SUCCESS" && purchase.status === "PENDING") {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: { status: "COMPLETED" },
        });
      }

      logger.info("Payment status updated", {
        purchaseId,
        paymentId: purchase.payment.id,
        oldStatus: purchase.payment.paymentStatus,
        newStatus: validatedData.paymentStatus,
        updatedBy: session?.user?.email,
      });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดทสำเร็จ",
      data: updatedData,
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

    logger.error("Error updating purchase:", {
      error: error instanceof Error ? error.message : "Unknown error",
      purchaseId: (await params).id,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update purchase",
      },
      { status: 500 }
    );
  }
}
