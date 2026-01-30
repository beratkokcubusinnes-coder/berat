import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    const params = await props.params;
    const pathSegments = params.path;

    if (!pathSegments || pathSegments.length === 0) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // Prevent path traversal
    const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

    if (!resolvedPath.startsWith(uploadsDir)) {
        return new NextResponse("Access Denied", { status: 403 });
    }

    try {
        // Check if file exists
        await stat(resolvedPath);

        // Read file
        const fileBuffer = await readFile(resolvedPath);

        // Determine content type
        const ext = path.extname(resolvedPath).toLowerCase();
        let contentType = "application/octet-stream";

        switch (ext) {
            case ".jpg":
            case ".jpeg":
                contentType = "image/jpeg";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".webp":
                contentType = "image/webp";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            case ".svg":
                contentType = "image/svg+xml";
                break;
            case ".mp4":
                contentType = "video/mp4";
                break;
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        // If file not found or read error
        return new NextResponse("Not Found", { status: 404 });
    }
}
