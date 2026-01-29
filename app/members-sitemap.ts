import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function members(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const users = await prisma.user.findMany({
        select: { username: true, updatedAt: true }
    });

    const routes: MetadataRoute.Sitemap = [];

    users.forEach(user => {
        const path = `/profile/${user.username}`;
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: user.updatedAt,
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    return routes;
}
