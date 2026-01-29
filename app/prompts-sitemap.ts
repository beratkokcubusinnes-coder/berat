import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function prompts(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

    const prompts = await prisma.prompt.findMany({
        select: {
            slug: true,
            updatedAt: true,
            categoryData: {
                select: {
                    slug: true
                }
            }
        }
    });

    const routes: MetadataRoute.Sitemap = [];

    prompts.forEach(prompt => {
        const categorySlug = prompt.categoryData?.slug || 'uncategorized';
        const path = `/prompt/${categorySlug}/${prompt.slug}`;
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: prompt.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.8,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    return routes;
}
