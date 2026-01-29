import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function tools(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const tools = await prisma.tool.findMany({
        select: { slug: true, updatedAt: true }
    });

    const routes: MetadataRoute.Sitemap = [];

    tools.forEach(tool => {
        const path = `/tool/${tool.slug}`;
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: tool.updatedAt,
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
