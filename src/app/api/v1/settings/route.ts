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
                    showWelcome: true
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

        const { welcomeTitle, welcomeSubtitle, showWelcome } = validationResult.data;

        // ดึง settings ปัจจุบัน
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            // สร้างใหม่ถ้ายังไม่มี
            settings = await prisma.siteSettings.create({
                data: {
                    welcomeTitle: welcomeTitle || "Welcome to PKM Shop",
                    welcomeSubtitle: welcomeSubtitle || null,
                    showWelcome: showWelcome !== undefined ? showWelcome : true
                }
            });
        } else {
            // อัปเดต
            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: {
                    welcomeTitle: welcomeTitle !== undefined ? welcomeTitle : settings.welcomeTitle,
                    welcomeSubtitle: welcomeSubtitle !== undefined ? welcomeSubtitle : settings.welcomeSubtitle,
                    showWelcome: showWelcome !== undefined ? showWelcome : settings.showWelcome
                }
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
