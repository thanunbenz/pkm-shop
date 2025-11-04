import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { authRateLimiter, getClientIp } from "@/lib/rateLimit";
import logger from "@/lib/logger";
import { z } from "zod";

// Try to import Zod, fallback to manual validation
let registerSchema: z.ZodSchema | null = null;
let validationErrorResponse: ((error: z.ZodError) => NextResponse) | null = null;
let isZodError: ((error: unknown) => error is z.ZodError) | null = null;

try {
    const validations = require("@/lib/validations");
    const validationError = require("@/lib/utils/validation-error");
    registerSchema = validations.registerSchema;
    validationErrorResponse = validationError.validationErrorResponse;
    isZodError = validationError.isZodError;
} catch (error) {
    logger.info("Zod not installed, using manual validation");
}

// Manual validation function (fallback)
interface RegisterBody {
    fname?: string;
    lname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function manualValidation(body: RegisterBody) {
    const errors: Record<string, string[]> = {};

    if (!body.fname || body.fname.length < 2) {
        errors.fname = ["ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"];
    }
    if (!body.lname || body.lname.length < 2) {
        errors.lname = ["นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"];
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.email = ["รูปแบบอีเมลไม่ถูกต้อง"];
    }
    if (!body.password || body.password.length < 8) {
        errors.password = ["รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"];
    }
    if (body.password !== body.confirmPassword) {
        errors.confirmPassword = ["รหัสผ่านไม่ตรงกัน"];
    }

    return Object.keys(errors).length > 0 ? { success: false, errors } : { success: true };
}

export async function POST(req: NextRequest) {
    try {
        // Rate limiting check
        const clientIp = getClientIp(req);
        const rateLimitResult = await authRateLimiter.check(`register:${clientIp}`);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Too many registration attempts. Please try again later."
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    }
                }
            );
        }

        const body = await req.json();

        // Validate request body
        let fname: string, lname: string, email: string, password: string;

        if (registerSchema && validationErrorResponse) {
            // Use Zod validation if available
            const validationResult = registerSchema.safeParse(body);

            if (!validationResult.success) {
                return validationErrorResponse(validationResult.error);
            }

            const data = validationResult.data as {
                fname: string;
                lname: string;
                email: string;
                password: string;
            };
            ({ fname, lname, email, password } = data);
        } else {
            // Use manual validation as fallback
            const validation = manualValidation(body);

            if (!validation.success) {
                // Format error messages for display
                const errorMessages = validation.errors
                    ? Object.entries(validation.errors)
                        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                        .join("; ")
                    : "Validation failed";

                return NextResponse.json(
                    {
                        success: false,
                        error: `Validation failed: ${errorMessages}`,
                        errors: validation.errors
                    },
                    { status: 400 }
                );
            }

            const bodyData = body as RegisterBody;
            fname = bodyData.fname!;
            lname = bodyData.lname!;
            email = bodyData.email!;
            password = bodyData.password!;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: "This email is already registered. Please log in."
                },
                { status: 400 }
            );
        }

        // Hash password and create user
        const hashedPassword = await hash(password, 10);
        const user = await prisma.user.create({
            data: {
                fname,
                lname,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully!",
                data: user,
            },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                }
            }
        );
    } catch (error) {
        logger.error("Registration Error:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });

        if (isZodError && validationErrorResponse && isZodError(error)) {
            return validationErrorResponse(error);
        }

        return NextResponse.json(
            {
                success: false,
                error: "An unexpected error occurred. Please try again."
            },
            { status: 500 }
        );
    }
}
