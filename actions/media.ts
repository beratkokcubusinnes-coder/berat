'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import { join } from "path"
import { saveContentImage } from "@/lib/upload-utils"

/**
 * Standard Media Library Actions
 */

export async function getMedia() {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    return await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function uploadMedia(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: "No file provided" };

    try {
        // Use the centralized utility for saving and optimization
        const url = await saveContentImage(file, file.name, "misc", true);

        // Find the record created by saveContentImage
        const media = await prisma.media.findFirst({
            where: { url },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: media };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function updateMedia(id: string, data: any) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const media = await prisma.media.update({
        where: { id },
        data: {
            altText: data.altText,
            caption: data.caption,
            description: data.description
        }
    });

    return { success: true, data: media };
}

export async function deleteMedia(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: "Media not found" };

    if (media.url.startsWith('/uploads/')) {
        try {
            const filePath = join(process.cwd(), "public", media.url);
            await unlink(filePath);
        } catch (e) {
            console.error(`File deletion failed: ${media.url}`, e);
        }
    }

    await prisma.media.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return { success: true };
}

/**
 * Advanced Optimization & Cleanup Actions (Orphaned Files)
 */

export async function getUnusedMedia() {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const allMedia = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const usedUrls = new Set<string>();

    // Scan all possible tables for media references
    const users = await prisma.user.findMany({ select: { avatar: true, coverImage: true } });
    users.forEach(u => {
        if (u.avatar) usedUrls.add(u.avatar);
        if (u.coverImage) usedUrls.add(u.coverImage);
    });

    const prompts = await prisma.prompt.findMany({
        select: { image: true, images: true, ogImage: true, beforeImage: true, afterImage: true }
    });
    prompts.forEach(p => {
        if (p.image) usedUrls.add(p.image);
        if (p.ogImage) usedUrls.add(p.ogImage);
        if (p.beforeImage) usedUrls.add(p.beforeImage);
        if (p.afterImage) usedUrls.add(p.afterImage);
        if (p.images) {
            p.images.split(',').forEach(img => usedUrls.add(img.trim()));
        }
    });

    const items = [
        await prisma.script.findMany({ select: { image: true, ogImage: true } }),
        await prisma.hook.findMany({ select: { image: true, ogImage: true } }),
        await prisma.tool.findMany({ select: { image: true, ogImage: true } }),
        await prisma.blogPost.findMany({ select: { image: true, ogImage: true } })
    ];
    items.flat().forEach((item: any) => {
        if (item.image) usedUrls.add(item.image);
        if (item.ogImage) usedUrls.add(item.ogImage);
    });

    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['site_logo', 'site_icon', 'default_avatar'] } }
    });
    settings.forEach(s => usedUrls.add(s.value));

    const threads = await prisma.thread.findMany({ select: { mediaUrls: true } });
    threads.forEach(t => {
        if (t.mediaUrls) {
            try {
                const parsed = JSON.parse(t.mediaUrls);
                if (Array.isArray(parsed)) parsed.forEach(url => usedUrls.add(url));
                else usedUrls.add(t.mediaUrls);
            } catch {
                t.mediaUrls.split(',').forEach(url => usedUrls.add(url.trim()));
            }
        }
    });

    const unusedMedia = allMedia.filter(m => !usedUrls.has(m.url));
    return unusedMedia;
}

export async function deleteBulkMedia(ids: string[]) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const mediaToDelete = await prisma.media.findMany({
        where: { id: { in: ids } }
    });

    for (const media of mediaToDelete) {
        if (media.url.startsWith('/uploads/')) {
            try {
                const filePath = join(process.cwd(), "public", media.url);
                await unlink(filePath);
            } catch (e) {
                console.error(`Failed to delete file: ${media.url}`, e);
            }
        }
    }

    await prisma.media.deleteMany({
        where: { id: { in: ids } }
    });

    revalidatePath('/', 'layout');
    return { success: true };
}
