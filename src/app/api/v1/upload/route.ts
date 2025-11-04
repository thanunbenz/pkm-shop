import prisma from '@/lib/db'
import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import crypto from 'crypto'
import { uploadRateLimiter, getClientIp } from '@/lib/rateLimit'
import { hasStaffAccess, getUnauthorizedError } from '@/lib/utils/auth-helpers'
import logger from '@/lib/logger'

export const config = {
    api: {
        bodyParser: false,
    },
}

// MIME type signatures for validation
const MIME_SIGNATURES: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ALLOWED_EXTENSIONS: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
}

function validateFileType(buffer: Buffer, mimeType: string): boolean {
    // Special handling for WebP (RIFF container format)
    if (mimeType === 'image/webp') {
        // Check RIFF header at bytes 0-3
        const isRIFF = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
        // Check WEBP signature at bytes 8-11
        const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        return isRIFF && isWEBP
    }

    const signatures = MIME_SIGNATURES[mimeType]
    if (!signatures) return false

    return signatures.some(signature => {
        return signature.every((byte, index) => buffer[index] === byte)
    })
}

export async function POST(request: Request) {
    try {
        // Authentication check - Allow OPERATOR and ADMIN
        const session = await getServerSession(authOptions)

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            )
        }

        // Rate limiting check
        const clientIp = getClientIp(request)
        const rateLimitResult = await uploadRateLimiter.check(`upload:${clientIp}`)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many upload requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '10',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    }
                }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file uploaded or invalid file format' },
                { status: 400 }
            )
        }

        // File size validation
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

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Validate MIME type by checking file signature (magic bytes)
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type' },
                { status: 400 }
            )
        }

        const isValidType = validateFileType(buffer, file.type)
        if (!isValidType) {
            return NextResponse.json(
                { error: 'File content does not match file type' },
                { status: 400 }
            )
        }

        // Generate secure filename using UUID
        const fileExtension = ALLOWED_EXTENSIONS[file.type] || '.bin'
        const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, uniqueFilename)

        // Path traversal protection
        const realUploadDir = fs.realpathSync(uploadDir)
        const resolvedPath = path.resolve(filePath)
        if (!resolvedPath.startsWith(realUploadDir)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            )
        }

        // Write file
        await fs.promises.writeFile(filePath, buffer)

        // Save to database
        const fileData = await prisma.file.create({
            data: {
                name: uniqueFilename,
                path: `/uploads/${uniqueFilename}`,
                size: file.size,
            },
        })

        return NextResponse.json(
            {
                message: 'Upload successful',
                file: fileData,
            },
            { status: 200 }
        )
    } catch (error) {
        logger.error('Upload error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json(
            {
                error: 'Upload failed',
                suggestion: 'Please check the file format and size again'
            },
            { status: 500 }
        )
    }
}