import type { MetadataRoute } from 'next'
import { languages } from '@/lib/i18n'
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils'
import promptsSitemap from './prompts-sitemap'
import categoriesSitemap from './categories-sitemap'
import scriptsSitemap from './scripts-sitemap'
import hooksSitemap from './hooks-sitemap'
import toolsSitemap from './tools-sitemap'
import blogSitemap from './blog-sitemap'
import communitySitemap from './community-sitemap'
import membersSitemap from './members-sitemap'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const routes: MetadataRoute.Sitemap = [];

    // Static pages
    const basePaths = [
        { path: '/', priority: 1, freq: 'daily' },
        { path: '/prompts', priority: 0.9, freq: 'daily' },
        { path: '/scripts', priority: 0.9, freq: 'daily' },
        { path: '/hooks', priority: 0.9, freq: 'daily' },
        { path: '/tools', priority: 0.9, freq: 'daily' },
        { path: '/blog', priority: 0.8, freq: 'daily' },
        { path: '/community', priority: 0.7, freq: 'daily' },
        { path: '/members', priority: 0.6, freq: 'weekly' },
    ];

    basePaths.forEach(({ path, priority, freq }) => {
        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: new Date(),
                changeFrequency: freq as any,
                priority,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    // Dynamic content
    const [
        promptsRoutes,
        categoriesRoutes,
        scriptsRoutes,
        hooksRoutes,
        toolsRoutes,
        blogRoutes,
        communityRoutes,
        membersRoutes
    ] = await Promise.all([
        promptsSitemap(),
        categoriesSitemap(),
        scriptsSitemap(),
        hooksSitemap(),
        toolsSitemap(),
        blogSitemap(),
        communitySitemap(),
        membersSitemap()
    ]);

    return [
        ...routes,
        ...promptsRoutes,
        ...categoriesRoutes,
        ...scriptsRoutes,
        ...hooksRoutes,
        ...toolsRoutes,
        ...blogRoutes,
        ...communityRoutes,
        ...membersRoutes
    ];
}
