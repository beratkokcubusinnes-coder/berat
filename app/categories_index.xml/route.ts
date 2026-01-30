import { NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemap-generator';
import categoriesSitemap from '../categories-sitemap';

export async function GET() {
    const routes = await categoriesSitemap();
    const xml = generateSitemapXml(routes);
    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate' } });
}
