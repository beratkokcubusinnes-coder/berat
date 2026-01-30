import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import path from "path";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawFilename = `block-${Date.now()}${path.extname(file.name)}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "blocks");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, rawFilename), buffer);

    const url = `/uploads/blocks/${rawFilename}`;

    // Add to Media Library
    try {
        await prisma.media.create({
            data: {
                url,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
            }
        });
    } catch (e) {
        console.error("Failed to add block image to media library", e);
    }

    return NextResponse.json({ url });
}
