import { NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemap-generator';
import blogSitemap from '../blog-sitemap';

export async function GET() {
    const routes = await blogSitemap();
    const xml = generateSitemapXml(routes);
    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate' } });
}
