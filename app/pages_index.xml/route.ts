import { NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemap-generator';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';
import { MetadataRoute } from 'next';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const routes: MetadataRoute.Sitemap = [];

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

    const xml = generateSitemapXml(routes);

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
        },
    });
}
