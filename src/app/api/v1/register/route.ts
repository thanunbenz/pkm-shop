import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { authRateLimiter, getClientIp } from "@/lib/rateLimit";

// Try to import Zod, fallback to manual validation
let registerSchema: any = null;
let validationErrorResponse: any = null;
let isZodError: any = null;

try {
    const validations = require("@/lib/validations");
    const validationError = require("@/lib/utils/validation-error");
    registerSchema = validations.registerSchema;
    validationErrorResponse = validationError.validationErrorResponse;
    isZodError = validationError.isZodError;
} catch (error) {
    console.log("Zod not installed, using manual validation");
}

// Manual validation function (fallback)
function manualValidation(body: any) {
    const errors: any = {};

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
        if (registerSchema && validationErrorResponse) {
            // Use Zod validation if available
            const validationResult = registerSchema.safeParse(body);

            if (!validationResult.success) {
                return validationErrorResponse(validationResult.error);
            }

            var { fname, lname, email, password } = validationResult.data;
        } else {
            // Use manual validation as fallback
            const validation = manualValidation(body);

            if (!validation.success) {
                // Format error messages for display
                const errorMessages = Object.entries(validation.errors)
                    .map(([field, messages]: [string, any]) => `${field}: ${messages.join(", ")}`)
                    .join("; ");

                return NextResponse.json(
                    {
                        success: false,
                        error: `Validation failed: ${errorMessages}`,
                        errors: validation.errors
                    },
                    { status: 400 }
                );
            }

            var { fname, lname, email, password } = body;
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
        console.error("Registration Error:", error);

        if (isZodError && isZodError(error)) {
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
