import { NextResponse } from 'next/server';
import { generateSitemapXml, generateSitemapIndexXml } from '@/lib/sitemap-generator';
import promptsSitemap from '../prompts-sitemap';
import scriptsSitemap from '../scripts-sitemap';
import hooksSitemap from '../hooks-sitemap';
import toolsSitemap from '../tools-sitemap';
import blogSitemap from '../blog-sitemap';
import categoriesSitemap from '../categories-sitemap';
import communitySitemap from '../community-sitemap';
import membersSitemap from '../members-sitemap';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

    const sitemaps = [
        `${baseUrl}/pages_index.xml`,
        `${baseUrl}/categories_index.xml`,
        `${baseUrl}/prompts_index.xml`,
        `${baseUrl}/scripts_index.xml`,
        `${baseUrl}/hooks_index.xml`,
        `${baseUrl}/tools_index.xml`,
        `${baseUrl}/blog_index.xml`,
        `${baseUrl}/community_index.xml`,
        `${baseUrl}/members_index.xml`,
    ];

    const xml = generateSitemapIndexXml(sitemaps);

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
        },
    });
}
