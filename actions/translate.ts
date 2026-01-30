"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { translateText } from "@/lib/translator";
import { saveContentTranslation } from "@/lib/translations";
import { revalidatePath } from "next/cache";

export async function autoTranslateContent(
    contentId: string,
    contentType: 'prompt' | 'script' | 'hook' | 'tool' | 'blog'
) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    try {
        // 1. Fetch original content (assuming it's in English or the base language)
        let original: any;
        if (contentType === 'prompt') original = await prisma.prompt.findUnique({ where: { id: contentId } });
        else if (contentType === 'script') original = await (prisma as any).script.findUnique({ where: { id: contentId } });
        else if (contentType === 'hook') original = await (prisma as any).hook.findUnique({ where: { id: contentId } });
        else if (contentType === 'tool') original = await (prisma as any).tool.findUnique({ where: { id: contentId } });
        else if (contentType === 'blog') original = await (prisma as any).blogPost.findUnique({ where: { id: contentId } });

        if (!original) throw new Error("Content not found");

        const targetLanguages = ['tr', 'de', 'es'] as const;

        const results = await Promise.all(targetLanguages.map(async (lang) => {
            // Translate core fields
            const translatedTitle = await translateText(original.title, lang);
            const translatedDescription = original.description ? await translateText(original.description, lang) : "";

            // For content (Rich text or long text), we might want to be careful with HTML tags
            // But for simple fields it works well.
            const translatedContent = original.content ? await translateText(original.content, lang) : "";

            // Prepare Translation Data
            const translationData = {
                title: translatedTitle,
                description: translatedDescription || undefined,
                content: translatedContent || undefined,
                metaTitle: translatedTitle,
                metaDescription: translatedDescription || undefined,
            };

            // Save to DB
            return await saveContentTranslation(contentType, contentId, lang, translationData);
        }));

        revalidatePath(`/[lang]/admin/${contentType === 'blog' ? 'blog' : contentType + 's'}`, 'page');

        return { success: true, translated: results.length };
    } catch (error: any) {
        console.error("Auto-translation failed:", error);
        return { success: false, error: error.message };
    }
}
