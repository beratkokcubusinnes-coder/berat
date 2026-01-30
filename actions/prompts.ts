'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { saveContentTranslation } from '@/lib/translations'
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import path from "path"

const PromptSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    model: z.string().min(1, "Model is required"),
    category: z.string().min(1, "Category is required"),
    categoryId: z.string().optional(),
    images: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    // SEO & Metadata
    slug: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
    tldr: z.string().optional(),
    noIndex: z.boolean().default(false),
    noFollow: z.boolean().default(false),
    lastUpdated: z.string().optional(),
    promptCount: z.number().optional(),
    promptType: z.string().optional(),
    authorName: z.string().optional(),
    authorBio: z.string().optional(),
    beforeImage: z.string().optional(),
    afterImage: z.string().optional(),
    views: z.number().optional().default(0),
    likes: z.number().optional().default(0),
    isFeatured: z.boolean().default(false),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED'),
})

export type PromptState = {
    errors?: Record<string, string[]>
    message?: string
    success?: boolean
}

export async function createPrompt(prevState: PromptState, formData: FormData): Promise<PromptState> {
    const lang = formData.get('lang') as string || 'en';
    const session = await getSession();
    if (!session || !session.userId) {
        return { message: "Unauthorized" };
    }

    // Handle File Uploads
    try {
        const title = formData.get('title') as string || 'prompt';
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
            const url = await savePromptImage(imageFile, title);
            formData.set('image', url);
            formData.set('images', url);
        }

        const beforeImageFile = formData.get('beforeImageFile') as File;
        if (beforeImageFile && beforeImageFile.size > 0 && beforeImageFile.name !== "undefined") {
            const url = await savePromptImage(beforeImageFile, `${title}-before`);
            formData.set('beforeImage', url);
        }

        const afterImageFile = formData.get('afterImageFile') as File;
        if (afterImageFile && afterImageFile.size > 0 && afterImageFile.name !== "undefined") {
            const url = await savePromptImage(afterImageFile, `${title}-after`);
            formData.set('afterImage', url);
        }
    } catch (error: any) {
        console.error("File upload error:", error);
        return { message: `File upload failed. Please checking permissions. Details: ${error.message}` };
    }

    const validatedFields = PromptSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        model: formData.get('model'),
        category: formData.get('category'),
        categoryId: (formData.get('categoryId') as string | null) ?? undefined,
        images: (formData.get('images') as string | null) ?? undefined,
        image: (formData.get('image') as string | null) ?? undefined,
        description: (formData.get('description') as string | null) ?? undefined,
        slug: (formData.get('slug') as string | null) ?? undefined,
        metaTitle: (formData.get('metaTitle') as string | null) ?? undefined,
        metaDescription: (formData.get('metaDescription') as string | null) ?? undefined,
        canonicalUrl: (formData.get('canonicalUrl') as string | null) ?? undefined,
        ogTitle: (formData.get('ogTitle') as string | null) ?? undefined,
        ogDescription: (formData.get('ogDescription') as string | null) ?? undefined,
        ogImage: (formData.get('ogImage') as string | null) ?? undefined,
        tldr: (formData.get('tldr') as string | null) ?? undefined,
        noIndex: formData.get('noIndex') === 'on',
        noFollow: formData.get('noFollow') === 'on',
        lastUpdated: (formData.get('lastUpdated') as string | null) ?? undefined,
        promptCount: formData.get('promptCount') ? parseInt(formData.get('promptCount') as string) : undefined,
        promptType: (formData.get('promptType') as string | null) ?? undefined,
        authorName: (formData.get('authorName') as string | null) ?? undefined,
        authorBio: (formData.get('authorBio') as string | null) ?? undefined,
        beforeImage: (formData.get('beforeImage') as string | null) ?? undefined,
        afterImage: (formData.get('afterImage') as string | null) ?? undefined,
        views: formData.get('views') ? parseInt(formData.get('views') as string) : 0,
        likes: formData.get('likes') ? parseInt(formData.get('likes') as string) : 0,
        isFeatured: formData.get('isFeatured') === 'on',
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    try {
        // --- START OF SYSTEM SETTINGS ENFORCEMENT ---
        const { getSystemSetting } = await import('@/lib/settings');
        const dailyLimit = parseInt(await getSystemSetting('daily_prompt_limit'));
        const cooldownMinutes = parseInt(await getSystemSetting('post_cool_down_minutes'));

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Check Daily Limit
        const dailyCount = await prisma.prompt.count({
            where: {
                authorId: session.userId as string,
                createdAt: { gte: startOfToday }
            }
        });

        if (dailyCount >= dailyLimit) {
            return { message: `Daily prompt limit reached (${dailyLimit}). Please try again tomorrow.` };
        }

        // Check Cooldown
        const lastPrompt = await prisma.prompt.findFirst({
            where: { authorId: session.userId as string },
            orderBy: { createdAt: 'desc' }
        });

        if (lastPrompt) {
            const diffMinutes = (Date.now() - new Date(lastPrompt.createdAt).getTime()) / 60000;
            if (diffMinutes < cooldownMinutes) {
                const wait = Math.ceil(cooldownMinutes - diffMinutes);
                return { message: `Spam protection: Please wait ${wait} more minute(s) before posting again.` };
            }
        }
        // --- END OF SYSTEM SETTINGS ENFORCEMENT ---

        const createdPrompt = await prisma.prompt.create({
            data: {
                title: data.title,
                slug: data.slug || slugify(data.title),
                content: data.content,
                model: data.model,
                category: data.category,
                categoryId: data.categoryId,
                description: data.description,
                image: data.image,
                images: data.images || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
                authorId: session.userId as string,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                canonicalUrl: data.canonicalUrl,
                ogTitle: data.ogTitle,
                ogDescription: data.ogDescription,
                ogImage: data.ogImage,
                tldr: data.tldr,
                noIndex: data.noIndex,
                noFollow: data.noFollow,
                lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
                promptCount: data.promptCount,
                promptType: data.promptType,
                authorName: data.authorName,
                authorBio: data.authorBio,
                beforeImage: data.beforeImage,
                afterImage: data.afterImage,
                views: data.views,
                likes: data.likes,
                isFeatured: data.isFeatured,
            } as any
        });

        // Handle Translations if provided
        const translationsJson = formData.get('translations') as string;
        if (translationsJson && createdPrompt) {
            try {
                const translations = JSON.parse(translationsJson);
                await Promise.all(
                    Object.entries(translations)
                        .filter(([langCode]) => langCode !== 'en')
                        .map(([langCode, transData]: [string, any]) =>
                            saveContentTranslation(
                                'prompt',
                                createdPrompt.id,
                                langCode as any,
                                transData
                            )
                        )
                );
            } catch (err) {
                console.error("Failed to save translations:", err);
            }
        }

        revalidatePath('/');
        revalidatePath(`/${lang}/admin/prompts`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create prompt:", error);
        return { message: "Database Error: Failed to create prompt." };
    }
}

export async function updatePrompt(id: string, prevState: PromptState, formData: FormData): Promise<PromptState> {
    const lang = formData.get('lang') as string || 'en';
    const session = await getSession();
    if (!session || !session.userId) return { message: "Unauthorized" };

    // Handle File Uploads
    try {
        const title = formData.get('title') as string || 'prompt';
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
            const url = await savePromptImage(imageFile, title);
            formData.set('image', url);
            formData.set('images', url);
        }

        const beforeImageFile = formData.get('beforeImageFile') as File;
        if (beforeImageFile && beforeImageFile.size > 0 && beforeImageFile.name !== "undefined") {
            const url = await savePromptImage(beforeImageFile, `${title}-before`);
            formData.set('beforeImage', url);
        }

        const afterImageFile = formData.get('afterImageFile') as File;
        if (afterImageFile && afterImageFile.size > 0 && afterImageFile.name !== "undefined") {
            const url = await savePromptImage(afterImageFile, `${title}-after`);
            formData.set('afterImage', url);
        }
    } catch (error: any) {
        console.error("File upload error:", error);
        return { message: `File upload failed: ${error.message}` };
    }

    const validatedFields = PromptSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        model: formData.get('model'),
        category: formData.get('category'),
        categoryId: (formData.get('categoryId') as string | null) ?? undefined,
        images: (formData.get('images') as string | null) ?? undefined,
        image: (formData.get('image') as string | null) ?? undefined,
        description: (formData.get('description') as string | null) ?? undefined,
        slug: (formData.get('slug') as string | null) ?? undefined,
        metaTitle: (formData.get('metaTitle') as string | null) ?? undefined,
        metaDescription: (formData.get('metaDescription') as string | null) ?? undefined,
        canonicalUrl: (formData.get('canonicalUrl') as string | null) ?? undefined,
        ogTitle: (formData.get('ogTitle') as string | null) ?? undefined,
        ogDescription: (formData.get('ogDescription') as string | null) ?? undefined,
        ogImage: (formData.get('ogImage') as string | null) ?? undefined,
        tldr: (formData.get('tldr') as string | null) ?? undefined,
        noIndex: formData.get('noIndex') === 'on',
        noFollow: formData.get('noFollow') === 'on',
        lastUpdated: (formData.get('lastUpdated') as string | null) ?? undefined,
        promptCount: formData.get('promptCount') ? parseInt(formData.get('promptCount') as string) : undefined,
        promptType: (formData.get('promptType') as string | null) ?? undefined,
        authorName: (formData.get('authorName') as string | null) ?? undefined,
        authorBio: (formData.get('authorBio') as string | null) ?? undefined,
        beforeImage: (formData.get('beforeImage') as string | null) ?? undefined,
        afterImage: (formData.get('afterImage') as string | null) ?? undefined,
        views: formData.get('views') ? parseInt(formData.get('views') as string) : 0,
        likes: formData.get('likes') ? parseInt(formData.get('likes') as string) : 0,
        isFeatured: formData.get('isFeatured') === 'on',
    });

    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors };

    const data = validatedFields.data;

    try {
        await prisma.prompt.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug || slugify(data.title),
                content: data.content,
                model: data.model,
                category: data.category,
                categoryId: data.categoryId,
                description: data.description,
                image: data.image,
                images: data.images || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                canonicalUrl: data.canonicalUrl,
                ogTitle: data.ogTitle,
                ogDescription: data.ogDescription,
                ogImage: data.ogImage,
                tldr: data.tldr,
                noIndex: data.noIndex,
                noFollow: data.noFollow,
                lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
                promptCount: data.promptCount,
                promptType: data.promptType,
                authorName: data.authorName,
                authorBio: data.authorBio,
                beforeImage: data.beforeImage,
                afterImage: data.afterImage,
                views: data.views,
                likes: data.likes,
                isFeatured: data.isFeatured,
            } as any
        });

        // Handle Translations if provided
        const translationsJson = formData.get('translations') as string;
        if (translationsJson) {
            try {
                const translations = JSON.parse(translationsJson);
                await Promise.all(
                    Object.entries(translations)
                        .filter(([langCode]) => langCode !== 'en')
                        .map(([langCode, transData]: [string, any]) =>
                            saveContentTranslation(
                                'prompt',
                                id,
                                langCode as any,
                                transData
                            )
                        )
                );
            } catch (err) {
                console.error("Failed to save translations:", err);
            }
        }

        revalidatePath('/');
        revalidatePath(`/${lang}/prompt/${data.slug || slugify(data.title)}`);
        revalidatePath(`/${lang}/admin/prompts`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update prompt:", error);
        return { message: "Database Error: Failed to update prompt." };
    }
}

const PublicPromptSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    model: z.string().min(1, "Model is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().optional(),
    beforeImage: z.string().optional(),
    afterImage: z.string().optional(),
})

export async function submitPublicPrompt(prevState: PromptState, formData: FormData): Promise<PromptState> {
    const session = await getSession();
    if (!session || !session.userId) return { message: "Unauthorized" };

    const validatedFields = PublicPromptSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        model: formData.get('model'),
        category: formData.get('category'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId'),
        beforeImage: formData.get('beforeImage'),
        afterImage: formData.get('afterImage'),
    });

    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors };

    const data = validatedFields.data;

    try {
        await prisma.prompt.create({
            data: {
                title: data.title,
                slug: slugify(data.title) + '-' + Math.random().toString(36).substring(2, 7),
                content: data.content,
                model: data.model,
                category: data.category,
                categoryId: data.categoryId,
                description: data.description,
                images: data.beforeImage || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
                authorId: session.userId as string,
                beforeImage: data.beforeImage,
                afterImage: data.afterImage,
                status: 'PENDING',
            } as any
        });

        return { success: true, message: "Prompt submitted successfully! It will be visible after admin approval." };
    } catch (error) {
        console.error("Failed to submit prompt:", error);
        return { message: "Failed to submit prompt. Please try again." };
    }
}

import { saveContentImage } from "@/lib/upload-utils"

async function savePromptImage(file: File, title: string = "prompt") {
    return saveContentImage(file, title, "prompts");
}
