import { prisma } from './prisma';

export type ContentType = 'prompt' | 'script' | 'hook' | 'tool' | 'blog';
export type LanguageCode = 'en' | 'tr' | 'de' | 'es';

export interface TranslationData {
    title: string;
    description?: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogTitle?: string;
    ogDescription?: string;
    seoContent?: string;
}

/**
 * Get translation for content in specific language
 */
export async function getContentTranslation(
    contentType: ContentType,
    contentId: string,
    language: LanguageCode
): Promise<TranslationData | null> {
    const translation = await prisma.contentTranslation.findUnique({
        where: {
            contentType_contentId_language: {
                contentType,
                contentId,
                language,
            },
        },
    });

    if (!translation) return null;

    return {
        title: translation.title,
        description: translation.description || undefined,
        content: translation.content || undefined,
        metaTitle: translation.metaTitle || undefined,
        metaDescription: translation.metaDescription || undefined,
        ogTitle: translation.ogTitle || undefined,
        ogDescription: translation.ogDescription || undefined,
        seoContent: translation.seoContent || undefined,
    };
}

/**
 * Get all translations for a content
 */
export async function getAllContentTranslations(
    contentType: ContentType,
    contentId: string
) {
    const translations = await prisma.contentTranslation.findMany({
        where: {
            contentType,
            contentId,
        },
    });

    return translations.reduce((acc, t) => {
        acc[t.language] = {
            title: t.title,
            description: t.description || undefined,
            content: t.content || undefined,
            metaTitle: t.metaTitle || undefined,
            metaDescription: t.metaDescription || undefined,
            ogTitle: t.ogTitle || undefined,
            ogDescription: t.ogDescription || undefined,
            seoContent: t.seoContent || undefined,
        };
        return acc;
    }, {} as Record<string, TranslationData>);
}

/**
 * Save or update translation
 */
export async function saveContentTranslation(
    contentType: ContentType,
    contentId: string,
    language: LanguageCode,
    data: TranslationData
) {
    return await prisma.contentTranslation.upsert({
        where: {
            contentType_contentId_language: {
                contentType,
                contentId,
                language,
            },
        },
        update: {
            ...data,
        },
        create: {
            contentType,
            contentId,
            language,
            ...data,
        },
    });
}

/**
 * Delete translation
 */
export async function deleteContentTranslation(
    contentType: ContentType,
    contentId: string,
    language: LanguageCode
) {
    return await prisma.contentTranslation.delete({
        where: {
            contentType_contentId_language: {
                contentType,
                contentId,
                language,
            },
        },
    });
}

/**
 * Get content with translation fallback
 * Returns translated content if available, otherwise returns original
 */
export async function getContentWithTranslation(
    baseContent: any,
    contentType: ContentType,
    contentId: string,
    language: LanguageCode
) {
    const translation = await getContentTranslation(contentType, contentId, language);

    if (!translation) {
        return baseContent; // Return original if no translation
    }

    // Merge translation with base content
    return {
        ...baseContent,
        title: translation.title,
        description: translation.description || baseContent.description,
        content: translation.content || baseContent.content,
        metaTitle: translation.metaTitle || baseContent.metaTitle,
        metaDescription: translation.metaDescription || baseContent.metaDescription,
        ogTitle: translation.ogTitle || baseContent.ogTitle,
        ogDescription: translation.ogDescription || baseContent.ogDescription,
        seoContent: translation.seoContent,
        isTranslated: true,
        translatedLanguage: language,
    };
}
