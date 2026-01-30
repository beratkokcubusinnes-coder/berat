'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import { join } from "path"

export async function getUnusedMedia() {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    // 1. Get all media
    const allMedia = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // 2. Collect ALL used URLs in the system
    const usedUrls = new Set<string>();

    // Users
    const users = await prisma.user.findMany({ select: { avatar: true, coverImage: true } });
    users.forEach(u => {
        if (u.avatar) usedUrls.add(u.avatar);
        if (u.coverImage) usedUrls.add(u.coverImage);
    });

    // Prompts
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

    // Scripts, Hooks, Tools, Blogs (Common pattern)
    const scripts = await prisma.script.findMany({ select: { image: true, ogImage: true } });
    scripts.forEach(s => { if (s.image) usedUrls.add(s.image); if (s.ogImage) usedUrls.add(s.ogImage); });

    const hooks = await prisma.hook.findMany({ select: { image: true, ogImage: true } });
    hooks.forEach(h => { if (h.image) usedUrls.add(h.image); if (h.ogImage) usedUrls.add(h.ogImage); });

    const tools = await prisma.tool.findMany({ select: { image: true, ogImage: true } });
    tools.forEach(t => { if (t.image) usedUrls.add(t.image); if (t.ogImage) usedUrls.add(t.ogImage); });

    const blogs = await prisma.blogPost.findMany({ select: { image: true, ogImage: true } });
    blogs.forEach(b => { if (b.image) usedUrls.add(b.image); if (b.ogImage) usedUrls.add(b.ogImage); });

    // System Settings (Logo, Icon etc)
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['site_logo', 'site_icon', 'default_avatar'] } }
    });
    settings.forEach(s => usedUrls.add(s.value));

    // Threads (mediaUrls might be JSON or comma separated)
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

    // Filter out unused
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
        // Delete from filesystem
        if (media.url.startsWith('/uploads/')) {
            try {
                const filePath = join(process.cwd(), "public", media.url);
                await unlink(filePath);
            } catch (e) {
                console.error(`Failed to delete file: ${media.url}`, e);
            }
        }
    }

    // Delete from DB
    await prisma.media.deleteMany({
        where: { id: { in: ids } }
    });

    revalidatePath('/', 'layout');
    return { success: true };
}
