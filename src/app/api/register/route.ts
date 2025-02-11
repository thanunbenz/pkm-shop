import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";

type UserInput = {
    fname: string;
    lname: string;
    email: string;
    password: string;
};

export async function POST(req: NextRequest) {
    try {
        const jsonBody: UserInput = await req.json();

        const { fname, lname, email, password } = jsonBody;
        if (!fname || !lname || !email || !password) {
            return NextResponse.json(
                { message: { error: "All fields are required." } },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json(
                { message: { error: "This email is already registered. Please log in." } },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(password, 10);
        await prisma.user.create({
            data: {
                fname,
                lname,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User registered successfully!" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { message: { error: "An unexpected error occurred. Please try again." } },
            { status: 500 }
        );
    }
}
