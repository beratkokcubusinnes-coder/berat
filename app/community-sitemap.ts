import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function community(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    // Assuming table name is Thread based on db.ts getThreads
    const posts = await prisma.thread.findMany({
        select: { slug: true, updatedAt: true }
    });

    const routes: MetadataRoute.Sitemap = [];

    posts.forEach(post => {
        const path = `/community/${post.slug}`;
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: post.updatedAt,
                changeFrequency: 'daily',
                priority: 0.6,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    return routes;
}
