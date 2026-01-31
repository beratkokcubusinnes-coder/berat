'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { saveContentTranslation } from '@/lib/translations'
import { saveContentImage } from '@/lib/upload-utils'
import { autoNotifyIndexing } from '@/actions/indexing'
import { getSystemSettings } from '@/lib/settings'

const ContentSchema = z.object({
    title: z.string().min(5, "Title is too short"),
    category: z.string().min(1, "Category is required"),
    categoryId: z.string().optional(),
    images: z.string().optional(),
    image: z.string().optional(), // Primary Featured Image
    content: z.string().min(10, "Content is too short"),
    description: z.string().optional(),
    language: z.string().optional(),
    type: z.enum(['script', 'hook', 'blog', 'tool', 'thread']),
    model: z.string().optional(),
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
    lastUpdated: z.string().optional(), // Date as string from form
    promptCount: z.number().optional(),
    promptType: z.string().optional(),
    authorName: z.string().optional(),
    authorBio: z.string().optional(),
})

export type ContentState = {
    errors?: Record<string, string[]>
    message?: string
    success?: boolean
}

export async function createAdminContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
    const session = await getSession();
    if (!session || !session.userId) return { message: "Unauthorized" };

    const type = formData.get('type') as string;
    const title = formData.get('title') as string || 'content';

    // Handle File Upload
    try {
        const imageFile = formData.get('imageFile') as File;
        const optimize = formData.get('imageOptimize') === 'on';
        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
            const url = await saveContentImage(imageFile, title, type + 's', optimize);
            formData.set('image', url);
            formData.set('images', url);
        }
    } catch (error) {
        console.error("File upload failed:", error);
    }

    const validatedFields = ContentSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        description: formData.get('description'),
        language: formData.get('language'),
        type,
        model: formData.get('model'),
        category: formData.get('category'),
        categoryId: formData.get('categoryId'),
        images: formData.get('images'),
        image: formData.get('image'),
        slug: formData.get('slug'),
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        canonicalUrl: formData.get('canonicalUrl'),
        ogTitle: formData.get('ogTitle'),
        ogDescription: formData.get('ogDescription'),
        ogImage: formData.get('ogImage'),
        tldr: formData.get('tldr'),
        noIndex: formData.get('noIndex') === 'on',
        noFollow: formData.get('noFollow') === 'on',
        lastUpdated: formData.get('lastUpdated'),
        promptCount: formData.get('promptCount') ? parseInt(formData.get('promptCount') as string) : undefined,
        promptType: formData.get('promptType'),
        authorName: formData.get('authorName'),
        authorBio: formData.get('authorBio'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;
    const finalSlug = data.slug || slugify(data.title);

    try {
        const commonData = {
            title: data.title,
            slug: finalSlug,
            image: data.image,
            category: data.category,
            categoryId: data.categoryId,
            description: data.description,
            images: data.images || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
            content: data.content,
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
            authorId: session.userId,
        };

        let createdContent: any = null;

        if (type === 'script') {
            createdContent = await (prisma as any).script.create({
                data: { ...commonData, language: data.language || 'Text' }
            });
        } else if (type === 'hook') {
            createdContent = await (prisma as any).hook.create({
                data: commonData
            });
        } else if (type === 'blog') {
            createdContent = await (prisma as any).blogPost.create({
                data: { ...commonData, published: true }
            });
        } else if (type === 'tool') {
            createdContent = await (prisma as any).tool.create({
                data: commonData
            });
        }

        // Handle Translations if provided
        const translationsJson = formData.get('translations') as string;
        if (translationsJson && createdContent) {
            try {
                const translations = JSON.parse(translationsJson);
                await Promise.all(
                    Object.entries(translations)
                        .filter(([langCode]) => langCode !== 'en')
                        .map(([langCode, transData]: [string, any]) =>
                            saveContentTranslation(
                                type as any,
                                createdContent.id,
                                langCode as any,
                                transData
                            )
                        )
                );
            } catch (err) {
                console.error("Failed to save translations:", err);
            }
        }

        revalidatePath(`/[lang]/admin/${type === 'blog' ? 'blog' : type + 's'}`, 'page');
        revalidatePath('/', 'layout');

        // Automatic Indexing Notification
        if (!commonData.noIndex && createdContent) {
            getSystemSettings().then(sys => {
                const baseUrl = sys.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
                const path = type === 'blog' ? 'blog' : (type === 'prompt' ? 'prompts' : type + 's');
                const url = `${baseUrl}/${path}/${createdContent.slug}`;
                autoNotifyIndexing(url);
            }).catch(e => console.error("Auto Indexing Error:", e));
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to create content:", error);
        return { message: "Database Error: Failed to create content. The slug might already be in use." };
    }
}

export async function updateAdminContent(id: string, prevState: ContentState, formData: FormData): Promise<ContentState> {
    const session = await getSession();
    if (!session || !session.userId) return { message: "Unauthorized" };

    const type = formData.get('type') as string;
    const title = formData.get('title') as string || 'content';

    // Handle File Upload
    try {
        const imageFile = formData.get('imageFile') as File;
        const optimize = formData.get('imageOptimize') === 'on';
        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
            const url = await saveContentImage(imageFile, title, type + 's', optimize);
            formData.set('image', url);
            formData.set('images', url);
        }
    } catch (error) {
        console.error("File upload failed:", error);
    }

    const validatedFields = ContentSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        description: formData.get('description'),
        language: formData.get('language'),
        type,
        model: formData.get('model'),
        category: formData.get('category'),
        categoryId: formData.get('categoryId'),
        images: formData.get('images'),
        image: formData.get('image'),
        slug: formData.get('slug'),
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        canonicalUrl: formData.get('canonicalUrl'),
        ogTitle: formData.get('ogTitle'),
        ogDescription: formData.get('ogDescription'),
        ogImage: formData.get('ogImage'),
        tldr: formData.get('tldr'),
        noIndex: formData.get('noIndex') === 'on',
        noFollow: formData.get('noFollow') === 'on',
        lastUpdated: formData.get('lastUpdated'),
        promptCount: formData.get('promptCount') ? parseInt(formData.get('promptCount') as string) : undefined,
        promptType: formData.get('promptType'),
        authorName: formData.get('authorName'),
        authorBio: formData.get('authorBio'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;
    const finalSlug = data.slug || slugify(data.title);

    try {
        const commonData = {
            title: data.title,
            slug: finalSlug,
            image: data.image,
            category: data.category,
            categoryId: data.categoryId,
            description: data.description,
            images: data.images,
            content: data.content,
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
        };

        if (type === 'script') {
            await (prisma as any).script.update({
                where: { id },
                data: { ...commonData, language: data.language || 'Text' }
            });
        } else if (type === 'hook') {
            await (prisma as any).hook.update({
                where: { id },
                data: commonData
            });
        } else if (type === 'blog') {
            await (prisma as any).blogPost.update({
                where: { id },
                data: commonData
            });
        } else if (type === 'tool') {
            await (prisma as any).tool.update({
                where: { id },
                data: commonData
            });
        } else if (type === 'thread') {
            await prisma.thread.update({
                where: { id },
                data: {
                    title: data.title,
                    content: data.content,
                }
            });
        }

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
                                type as any,
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

        revalidatePath(`/[lang]/admin/${type === 'blog' ? 'blog' : type + 's'}`, 'page');
        revalidatePath('/', 'layout');

        // Automatic Indexing Notification
        if (data.noIndex !== true) {
            getSystemSettings().then(sys => {
                const baseUrl = sys.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
                const path = type === 'blog' ? 'blog' : (type === 'prompt' ? 'prompts' : type + 's');
                const url = `${baseUrl}/${path}/${data.slug || finalSlug}`;
                autoNotifyIndexing(url);
            }).catch(e => console.error("Auto Indexing Error:", e));
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update content:", error);
        return { message: "Database Error: Failed to update content." };
    }
}

export async function deleteAdminContent(id: string, type: 'prompt' | 'script' | 'hook' | 'blog' | 'tool' | 'thread' | 'comment') {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    try {
        if (type === 'prompt') await prisma.prompt.delete({ where: { id } });
        else if (type === 'script') await (prisma as any).script.delete({ where: { id } });
        else if (type === 'hook') await (prisma as any).hook.delete({ where: { id } });
        else if (type === 'blog') await (prisma as any).blogPost.delete({ where: { id } });
        else if (type === 'tool') await (prisma as any).tool.delete({ where: { id } });
        else if (type === 'thread') await prisma.thread.delete({ where: { id } });
        else if (type === 'comment') await prisma.comment.delete({ where: { id } });

        revalidatePath(`/[lang]/admin/${type === 'blog' ? 'blog' : type + 's'}`, 'page');
        revalidatePath(`/[lang]/admin/community`, 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Delete failed:", error);
        return { success: false };
    }
}
