import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import path from "path"
import { slugify } from "./utils"
import { prisma } from "./prisma"
import sharp from "sharp"

/**
 * Saves content images with optional optimization.
 * Defaults to WEBP for better compression and SEO.
 */
export async function saveContentImage(file: File, title: string = "content", subDir: string = "misc", optimize: boolean = true) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SEO Optimized filename: title-random.ext
    // We default to .webp for better performance
    const originalExtension = path.extname(file.name).toLowerCase();
    const targetExtension = optimize ? ".webp" : originalExtension;

    const seoBase = slugify(title).slice(0, 50);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const rawFilename = `${seoBase}-${randomSuffix}${targetExtension}`;

    const uploadDir = join(process.cwd(), "public", "uploads", subDir);
    await mkdir(uploadDir, { recursive: true });

    let finalBuffer = buffer;
    if (optimize) {
        try {
            finalBuffer = await sharp(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
        } catch (e) {
            console.error("Sharp optimization failed, saving original", e);
            finalBuffer = buffer;
        }
    }

    await writeFile(join(uploadDir, rawFilename), finalBuffer);

    const url = `/uploads/${subDir}/${rawFilename}`;

    // Add to Media Library
    try {
        await prisma.media.create({
            data: {
                url,
                filename: rawFilename,
                mimeType: optimize ? "image/webp" : file.type,
                size: finalBuffer.length,
            }
        });
    } catch (e) {
        console.error("Failed to add image to media library", e);
    }

    return url;
}
