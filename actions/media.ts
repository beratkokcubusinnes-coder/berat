'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import path from 'path'

export async function getMedia() {
    try {
        return await prisma.media.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Failed to fetch media", e);
        return [];
    }
}

export async function updateMedia(id: string, data: { altText?: string, caption?: string, description?: string }) {
    try {
        const updated = await prisma.media.update({
            where: { id },
            data
        });
        revalidatePath('/admin/settings');
        return { success: true, data: updated };
    } catch (e) {
        console.error("Failed to update media", e);
        return { error: 'Update failed' };
    }
}

export async function deleteMedia(id: string) {
    try {
        // In a real app, you would also delete the file from storage (S3, etc.)
        await prisma.media.delete({
            where: { id }
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (e) {
        console.error("Failed to delete media", e);
        return { error: 'Delete failed' };
    }
}

export async function addMedia(data: { url: string, filename: string, mimeType?: string, size?: number, width?: number, height?: number }) {
    try {
        const media = await prisma.media.create({
            data
        });
        revalidatePath('/admin/settings');
        return { success: true, data: media };
    } catch (e) {
        console.error("Failed to add media", e);
        return { error: 'Upload recording failed' };
    }
}

export async function uploadMedia(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `media-${Date.now()}${path.extname(file.name)}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        await writeFile(join(uploadDir, filename), buffer);
        const url = `/uploads/media/${filename}`;

        const media = await prisma.media.create({
            data: {
                url,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
            }
        });

        revalidatePath('/admin/settings');
        return { success: true, data: media };
    } catch (e) {
        console.error("Upload error", e);
        return { error: 'Upload failed' };
    }
}
