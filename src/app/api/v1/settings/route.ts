import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { siteSettingsUpdateSchema } from "@/lib/validations/site-settings";
import logger from "@/lib/logger";

// GET - ดึง site settings (Public)
export async function GET() {
    try {
        // ดึง settings แรก หรือสร้างถ้ายังไม่มี
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    welcomeTitle: "Welcome to PKM Shop",
                    welcomeSubtitle: "Your one-stop shop for Pokémon TCG Live codes",
                    showWelcome: true,
                    supportEmail: process.env.EMAIL_SUPPORT || process.env.EMAIL_FROM || null,
                    enableEmailNotifications: true,
                }
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Error fetching settings:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// PUT - อัปเดต site settings (ADMIN/OPERATOR only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input with Zod schema
        const validationResult = siteSettingsUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const validatedFields = validationResult.data;

        // ดึง settings ปัจจุบัน
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            // สร้างใหม่ถ้ายังไม่มี
            settings = await prisma.siteSettings.create({
                data: {
                    welcomeTitle: validatedFields.welcomeTitle || "Welcome to PKM Shop",
                    welcomeSubtitle: validatedFields.welcomeSubtitle || null,
                    showWelcome: validatedFields.showWelcome !== undefined ? validatedFields.showWelcome : true,
                    supportEmail: validatedFields.supportEmail || process.env.EMAIL_SUPPORT || null,
                    enableEmailNotifications: validatedFields.enableEmailNotifications !== undefined ? validatedFields.enableEmailNotifications : true,
                    shopName: validatedFields.shopName || null,
                    seoTitle: validatedFields.seoTitle || null,
                    seoDescription: validatedFields.seoDescription || null,
                    seoKeywords: validatedFields.seoKeywords || null,
                    logoUrl: validatedFields.logoUrl || null,
                    faviconUrl: validatedFields.faviconUrl || null,
                    primaryColor: validatedFields.primaryColor || null,
                    disclaimer: validatedFields.disclaimer || null,
                }
            });
        } else {
            // อัปเดตเฉพาะฟิลด์ที่ส่งมา
            const updateData: Record<string, unknown> = {};

            if (validatedFields.welcomeTitle !== undefined) updateData.welcomeTitle = validatedFields.welcomeTitle;
            if (validatedFields.welcomeSubtitle !== undefined) updateData.welcomeSubtitle = validatedFields.welcomeSubtitle;
            if (validatedFields.showWelcome !== undefined) updateData.showWelcome = validatedFields.showWelcome;
            if (validatedFields.supportEmail !== undefined) updateData.supportEmail = validatedFields.supportEmail;
            if (validatedFields.enableEmailNotifications !== undefined) updateData.enableEmailNotifications = validatedFields.enableEmailNotifications;
            if (validatedFields.shopName !== undefined) updateData.shopName = validatedFields.shopName;
            if (validatedFields.seoTitle !== undefined) updateData.seoTitle = validatedFields.seoTitle;
            if (validatedFields.seoDescription !== undefined) updateData.seoDescription = validatedFields.seoDescription;
            if (validatedFields.seoKeywords !== undefined) updateData.seoKeywords = validatedFields.seoKeywords;
            if (validatedFields.logoUrl !== undefined) updateData.logoUrl = validatedFields.logoUrl;
            if (validatedFields.faviconUrl !== undefined) updateData.faviconUrl = validatedFields.faviconUrl;
            if (validatedFields.primaryColor !== undefined) updateData.primaryColor = validatedFields.primaryColor;
            if (validatedFields.disclaimer !== undefined) updateData.disclaimer = validatedFields.disclaimer;

            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: updateData
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Error updating settings:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
