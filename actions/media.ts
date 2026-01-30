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
        const url = await saveContentImage(file, file.name, "misc", true);
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

    // 1. Get all media records
    const allMedia = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const usedUrls = new Set<string>();

    // Regex to find all locally hosted upload URLs in strings (HTML, JSON, etc.)
    const uploadRegex = /\/uploads\/[^\s"'>)]+/g;

    const addUrlsFromText = (text: string | null | undefined) => {
        if (!text) return;
        const matches = text.match(uploadRegex);
        if (matches) {
            matches.forEach(match => {
                // Clean up potential trailing characters from regex capture in JSON/HTML
                const cleanUrl = match.replace(/[\\",;]$/, '');
                usedUrls.add(cleanUrl);
            });
        }
    };

    // --- SCAN SPECIFIC FIELDS ---

    // Users
    const users = await prisma.user.findMany({ select: { avatar: true, coverImage: true, bio: true } });
    users.forEach(u => {
        if (u.avatar) usedUrls.add(u.avatar);
        if (u.coverImage) usedUrls.add(u.coverImage);
        addUrlsFromText(u.bio);
    });

    // Prompts
    const prompts = await prisma.prompt.findMany({
        select: {
            image: true, images: true, ogImage: true, beforeImage: true, afterImage: true,
            content: true, description: true
        }
    });
    prompts.forEach(p => {
        if (p.image) usedUrls.add(p.image);
        if (p.ogImage) usedUrls.add(p.ogImage);
        if (p.beforeImage) usedUrls.add(p.beforeImage);
        if (p.afterImage) usedUrls.add(p.afterImage);
        if (p.images) p.images.split(',').forEach(img => usedUrls.add(img.trim()));
        addUrlsFromText(p.content);
        addUrlsFromText(p.description);
    });

    // Scripts, Hooks, Tools, Blogs
    const complexItems = [
        { data: await prisma.script.findMany({ select: { image: true, ogImage: true, content: true, description: true } }) },
        { data: await prisma.hook.findMany({ select: { image: true, ogImage: true, content: true, description: true } }) },
        { data: await prisma.tool.findMany({ select: { image: true, ogImage: true, content: true, description: true } }) },
        { data: await prisma.blogPost.findMany({ select: { image: true, ogImage: true, content: true, excerpt: true } }) }
    ];
    complexItems.forEach(group => {
        group.data.forEach((item: any) => {
            if (item.image) usedUrls.add(item.image);
            if (item.ogImage) usedUrls.add(item.ogImage);
            addUrlsFromText(item.content);
            addUrlsFromText(item.description || item.excerpt);
        });
    });

    // --- SCAN MASSIVE TEXT FIELDS & JSON ---

    // Page Blocks (Rich text, sliders, etc.)
    const blocks = await prisma.pageBlock.findMany({ select: { content: true } });
    blocks.forEach(b => addUrlsFromText(b.content));

    // Static Pages (About, Privacy, etc.)
    const staticPages = await prisma.staticPage.findMany({ select: { content: true } });
    staticPages.forEach(p => addUrlsFromText(p.content));

    // Category SEO content
    const categories = await prisma.category.findMany({ select: { seoContent: true } });
    categories.forEach(c => addUrlsFromText(c.seoContent));

    // Translations
    const translations = await prisma.contentTranslation.findMany({ select: { content: true, description: true, seoContent: true } });
    translations.forEach(t => {
        addUrlsFromText(t.content);
        addUrlsFromText(t.description);
        addUrlsFromText(t.seoContent);
    });

    // System Settings
    const settings = await prisma.systemSetting.findMany({ select: { value: true } });
    settings.forEach(s => {
        if (s.value.startsWith('/uploads/')) usedUrls.add(s.value);
        else addUrlsFromText(s.value);
    });

    // Threads
    const threads = await prisma.thread.findMany({ select: { mediaUrls: true, content: true } });
    threads.forEach(t => {
        addUrlsFromText(t.mediaUrls);
        addUrlsFromText(t.content);
    });

    // 2. Filter out media that is NOT in the used search
    // Duplicate protection: If two Media entries have different URLs points to different physical files, 
    // only the one present in content is kept.
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
