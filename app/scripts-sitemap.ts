import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function scripts(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const scripts = await prisma.script.findMany({
        select: { slug: true, updatedAt: true }
    });

    const routes: MetadataRoute.Sitemap = [];

    scripts.forEach(script => {
        const path = `/script/${script.slug}`;
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: script.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    return routes;
}
