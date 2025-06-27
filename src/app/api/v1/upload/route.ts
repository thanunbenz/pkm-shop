/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export const config = {
    api: {
        bodyParser: false,
    },
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file uploaded or invalid file format' },
                { status: 400 }
            )
        }

        const allowedExtensions = ['.pdf', '.jpg', '.png']
        const fileExtension = path.extname(file.name).toLowerCase()
        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json(
                { error: 'Only PDF, JPG, and PNG files are allowed' },
                { status: 400 }
            )
        }

        if (file.size <= 0) {
            return NextResponse.json(
                { error: 'Invalid file size' },
                { status: 400 }
            )
        }

        if (file.size > 1024 * 1024 * 5) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB' },
                { status: 400 }
            )
        }

        const existingFile = await prisma.file.findFirst({
            where: { name: file.name }
        })

        if (existingFile) {
            return NextResponse.json(
                { error: 'A file with this name already exists in the system' },
                { status: 400 }
            )
        }

        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const uniqueFilename = `${sanitizedFileName}_${timestamp}${fileExtension}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, uniqueFilename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        const fileData = await prisma.file.create({
            data: {
                name: uniqueFilename,
                path: `/uploads/${uniqueFilename}`,
                size: file.size,
            },
        });

        return NextResponse.json(
            {
                message: 'Upload successful',
                file: fileData,
                warning: 'Please review the file within 24 hours'
            },
            { status: 200 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {
                error: 'Upload failed',
                suggestion: 'Please check the file format and size again'
            },
            { status: 500 }
        )
    }
}