
import { getDictionary } from "@/lib/dictionary";
import { prisma } from "@/lib/prisma";
// import { SystemSetting } from "@prisma/client";

export async function getPageSeo(pageName: string, lang: string) {
    // 1. Get Static Defaults
    const dict = await getDictionary(lang) as any;
    const defaultMeta = dict[pageName] || {};

    // 2. Get DB Overrides
    // Keys format: seo_PAGE_FIELD_LANG (e.g., seo_Scripts_metaTitle_en)
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                startsWith: `seo_${pageName}_`
            }
        }
    });

    // Helper to find specific setting
    const getSetting = (field: string) => {
        const key = `seo_${pageName}_${field}_${lang}`;
        return settings.find(s => s.key === key)?.value;
    };

    const dbTitle = getSetting('metaTitle');
    const dbDesc = getSetting('metaDescription');
    const dbImage = getSetting('metaImage');

    return {
        title: dbTitle || defaultMeta.metaTitle || `${pageName} - Promptda`,
        description: dbDesc || defaultMeta.metaDescription || `Explore ${pageName} on Promptda`,
        image: dbImage || defaultMeta.metaImage || undefined,
        rawTitle: dbTitle || defaultMeta.metaTitle || pageName,
        rawDescription: dbDesc || defaultMeta.metaDescription
    };
}

export async function savePageSeo(pageName: string, lang: string, data: { metaTitle?: string; metaDescription?: string }) {
    const operations = [];

    if (data.metaTitle !== undefined) {
        operations.push(
            prisma.systemSetting.upsert({
                where: { key: `seo_${pageName}_metaTitle_${lang}` },
                update: { value: data.metaTitle },
                create: { key: `seo_${pageName}_metaTitle_${lang}`, value: data.metaTitle, type: 'seo' }
            })
        );
    }

    if (data.metaDescription !== undefined) {
        operations.push(
            prisma.systemSetting.upsert({
                where: { key: `seo_${pageName}_metaDescription_${lang}` },
                update: { value: data.metaDescription },
                create: { key: `seo_${pageName}_metaDescription_${lang}`, value: data.metaDescription, type: 'seo' }
            })
        );
    }

    await prisma.$transaction(operations);
}
