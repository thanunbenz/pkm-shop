/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/db'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'Please specify the ID of the file you want to delete' },
                { status: 400 }
            )
        }

        const existingFile = await prisma.file.findUnique({
            where: { id: id }
        })

        if (!existingFile) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            )
        }
        const filePath = path.join(process.cwd(), 'public/uploads', existingFile.name)

        try {
            await fs.unlink(filePath)
        } catch (err) {
            console.error('Error deleting file:', err)
            return NextResponse.json(
                { error: 'Failed to delete file from server' },
                { status: 500 }
            )
        }

        await prisma.file.delete({
            where: { id: existingFile.id }
        })

        return NextResponse.json(
            { message: 'File deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {
                error: 'An error occurred while deleting the file',
                suggestion: 'Please try again'
            },
            { status: 500 }
        )
    }
}


export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const file = await prisma.file.findUnique({
        where: { id: id }
    })
    return NextResponse.json(file)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const formData = await request.formData();
        const fileField = formData.get("file");
        if (!fileField || !(fileField instanceof File)) {
            return NextResponse.json(
                { error: "No data for update" },
                { status: 400 }
            );
        }

        const allowedExtensions = [".pdf", ".jpg", ".png"];
        const file = fileField as File;
        const fileExtension = path.extname(file.name).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json(
                { error: "Only PDF, JPG, and PNG files are allowed" },
                { status: 400 }
            );
        }
        if (file.size <= 0) {
            return NextResponse.json(
                { error: "Invalid file size" },
                { status: 400 }
            );
        }
        if (file.size > 1024 * 1024 * 5) {
            return NextResponse.json(
                { error: "File size exceeds 5MB" },
                { status: 400 }
            );
        }

        const existingFile = await prisma.file.findUnique({
            where: { id: id },
        });

        if (!existingFile) {
            return NextResponse.json(
                { error: "File to be updated not found" },
                { status: 404 }
            );
        }
        const filePath = path.join(process.cwd(), 'public/uploads', existingFile.name)

        try {
            await fs.unlink(filePath)
        } catch (err) {
            console.error('Error deleting file:', err)
            return NextResponse.json(
                { error: 'Failed to delete file from server' },
                { status: 500 }
            )
        }

        const product = await prisma.product.updateMany({
            where: { imageId: existingFile.id },
            data: {
                imageId: "-",
                image: "/uploads/no_image_available.svg",
            },
        });

        if (product) {
            const timestamp = Date.now();
            const sanitizedFileName = file.name
                .replace(/\s+/g, "_")
                .replace(/[^\w.-]/g, "");
            const uniqueFilename = `${sanitizedFileName}_${timestamp}${fileExtension}`;
            const newPath = `/uploads/${uniqueFilename}`;

            const uploadDir = path.join(process.cwd(), "public", "uploads");
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            const oldFilePath = path.join(
                process.cwd(),
                "public",
                "uploads",
                existingFile.name
            );
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                if (err instanceof Error && (err as any).code !== "ENOENT") {
                    console.error("Failed to delete old file:", err);
                }
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const filePath = path.join(uploadDir, uniqueFilename);
            await fs.writeFile(filePath, buffer);

            const updatedFile = await prisma.file.update({
                where: { id: id },
                data: {
                    name: uniqueFilename,
                    path: newPath,
                    size: file.size,
                },
            });

            return NextResponse.json({ file: updatedFile });
        }
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the file" },
            { status: 500 }
        );
    }
}
