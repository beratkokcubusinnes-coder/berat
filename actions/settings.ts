'use server'

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import path from "path"

export async function updateSystemSettings(formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) return { error: "Unauthorized" };
    // TODO: Strict admin role check
    // if (session.role !== 'admin') return { error: "Forbidden" };

    const settingsKeys = [
        "daily_prompt_limit", "daily_community_post_limit", "daily_comment_limit",
        "post_cool_down_minutes", "new_user_restriction_hours",
        "enable_registration", "maintenance_mode",
        "auto_approve_threads", "auto_approve_comments", "word_blacklist",
        "google_analytics_id", "meta_tags_extra", "custom_footer_script",
        "max_image_upload_size_mb", "allowed_image_types",
        "navigation_sidebar", "navigation_header", "site_name", "site_favicon"
    ];

    try {
        // Handle Text Settings
        for (const key of settingsKeys) {
            const value = formData.get(key) as string;
            if (value !== null) {
                await prisma.systemSetting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: {
                        key,
                        value: String(value),
                        category: key.includes('limit') ? 'limits' : key.includes('post') ? 'security' : 'general',
                        type: (key === 'enable_registration' || key === 'maintenance_mode') ? 'boolean' : 'string'
                    }
                });
            }
        }

        // Handle Default Avatar Update
        const avatarFile = formData.get("default_avatar_file") as File;
        if (avatarFile && avatarFile.size > 0) {
            const avatarUrl = await saveSystemFile(avatarFile, "system-default-avatar");
            await prisma.systemSetting.upsert({
                where: { key: "default_avatar" },
                update: { value: avatarUrl },
                create: { key: "default_avatar", value: avatarUrl, category: "appearance", type: "image" }
            });
        }

        // Handle Site Logo Update
        const logoFile = formData.get("site_logo_file") as File;
        if (logoFile && logoFile.size > 0) {
            const logoUrl = await saveSystemFile(logoFile, "site-logo");
            await prisma.systemSetting.upsert({
                where: { key: "site_logo" },
                update: { value: logoUrl },
                create: { key: "site_logo", value: logoUrl, category: "appearance", type: "image" }
            });
        }

        // Handle Site Icon Update
        const iconFile = formData.get("site_icon_file") as File;
        if (iconFile && iconFile.size > 0) {
            const iconUrl = await saveSystemFile(iconFile, "site-icon");
            await prisma.systemSetting.upsert({
                where: { key: "site_icon" },
                update: { value: iconUrl },
                create: { key: "site_icon", value: iconUrl, category: "appearance", type: "image" }
            });
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Settings update error:", error);
        return { error: "Failed to update settings" };
    }
}
async function saveSystemFile(file: File, prefix: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawFilename = `${prefix}-${Date.now()}${path.extname(file.name)}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "system");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, rawFilename), buffer);

    const url = `/uploads/system/${rawFilename}`;

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
        console.error("Failed to add system file to media library", e);
    }

    return url;
}
