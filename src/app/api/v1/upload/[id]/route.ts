/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/db'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { hasStaffAccess, getUnauthorizedError } from '@/lib/utils/auth-helpers'

// MIME type signatures for validation
const MIME_SIGNATURES: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

function validateFileType(buffer: Buffer, fileExtension: string): boolean {
    // Special handling for WebP (RIFF container format)
    if (fileExtension === '.webp') {
        // Check RIFF header at bytes 0-3
        const isRIFF = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
        // Check WEBP signature at bytes 8-11
        const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        return isRIFF && isWEBP
    }

    // Map extensions to MIME types
    const extToMime: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
    }

    const mimeType = extToMime[fileExtension]
    if (!mimeType) return false

    const signatures = MIME_SIGNATURES[mimeType]
    if (!signatures) return false

    return signatures.some(signature => {
        return signature.every((byte, index) => buffer[index] === byte)
    })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Please specify the ID of the file you want to delete' },
                { status: 400 }
            )
        }

        // Convert string id to number for Prisma
        const fileId = parseInt(id);
        if (isNaN(fileId)) {
            return NextResponse.json(
                { error: 'Invalid file ID' },
                { status: 400 }
            )
        }

        const existingFile = await prisma.file.findUnique({
            where: { id: fileId }
        })

        if (!existingFile) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            )
        }

        // Extract filename from path (e.g., "/uploads/file.png" -> "file.png")
        const filename = existingFile.path.startsWith('/uploads/')
            ? existingFile.path.replace('/uploads/', '')
            : existingFile.name;

        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        try {
            await fs.unlink(filePath);
            console.log(`Successfully deleted file: ${filePath}`);
        } catch (err) {
            console.error('Error deleting file:', err);
            console.error('Attempted path:', filePath);
            // Don't return error here, continue to delete from database
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


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const fileId = parseInt(id);
    if (isNaN(fileId)) {
        return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }
    const file = await prisma.file.findUnique({
        where: { id: fileId }
    })
    return NextResponse.json(file)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Authentication check - Allow OPERATOR and ADMIN
        const session = await getServerSession(authOptions)

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            )
        }

        // Convert string id to number for Prisma
        const fileId = parseInt(id);
        if (isNaN(fileId)) {
            return NextResponse.json(
                { error: 'Invalid file ID' },
                { status: 400 }
            )
        }

        const formData = await request.formData();
        const fileField = formData.get("file");
        if (!fileField || !(fileField instanceof File)) {
            return NextResponse.json(
                { error: "No data for update" },
                { status: 400 }
            );
        }

        const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const file = fileField as File;
        const fileExtension = path.extname(file.name).toLowerCase();

        // Validate extension
        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json(
                { error: "Only PDF, JPG, JPEG, PNG, and WebP files are allowed" },
                { status: 400 }
            );
        }

        // Validate MIME type
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file MIME type" },
                { status: 400 }
            );
        }

        // Validate file size
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

        // Read file buffer for validation
        const buffer = Buffer.from(await file.arrayBuffer());

        // Validate file content matches extension
        const isValidType = validateFileType(buffer, fileExtension);
        if (!isValidType) {
            return NextResponse.json(
                { error: "File content does not match file type" },
                { status: 400 }
            );
        }

        const existingFile = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!existingFile) {
            return NextResponse.json(
                { error: "File to be updated not found" },
                { status: 404 }
            );
        }

        // First, upload new file
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

        // Path traversal protection
        const uploadDirStats = await fs.realpath(uploadDir);
        const newFilePath = path.join(uploadDir, uniqueFilename);
        const resolvedPath = path.resolve(newFilePath);

        if (!resolvedPath.startsWith(uploadDirStats)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }

        // Use the buffer we already read for validation
        await fs.writeFile(newFilePath, buffer);

        // Update file record in database
        const updatedFile = await prisma.file.update({
            where: { id: fileId },
            data: {
                name: uniqueFilename,
                path: newPath,
                size: file.size,
            },
        });

        // Update products that use this file (imageId is stored as string)
        await prisma.product.updateMany({
            where: { imageId: String(existingFile.id) },
            data: {
                image: newPath,
            },
        });

        // Update banners that use this file (imageId is stored as string)
        await prisma.banner.updateMany({
            where: { imageId: String(existingFile.id) },
            data: {
                image: newPath,
            },
        });

        // Delete old file after everything is updated
        const oldFilename = existingFile.path.startsWith('/uploads/')
            ? existingFile.path.replace('/uploads/', '')
            : existingFile.name;

        const oldFilePath = path.join(process.cwd(), 'public', 'uploads', oldFilename);

        try {
            await fs.unlink(oldFilePath);
            console.log(`Successfully deleted old file: ${oldFilePath}`);
        } catch (err) {
            console.error('Error deleting old file:', err);
            // Continue even if deletion fails
        }

        return NextResponse.json({ file: updatedFile });
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the file" },
            { status: 500 }
        );
    }
}
