
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
  const settings = await getSystemSettings();
  const lang = 'en';
  const limit = parseInt(settings.rss_feed_limit) || 20;

  try {
    // Fetch latest items from all core entities
    const [prompts, posts, scripts, threads] = await Promise.all([
      prisma.prompt.findMany({
        where: { status: 'APPROVED' },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: { categoryData: true }
      }),
      prisma.blogPost.findMany({
        where: { status: 'APPROVED' },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.script.findMany({
        where: { status: 'APPROVED' },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: { categoryData: true }
      }),
      prisma.thread.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Combine and sort all items by date
    const allItems = [
      ...prompts.map(p => ({
        title: p.title,
        link: `${baseUrl}/${lang}/prompt/${p.categoryData?.slug || 'general'}/${p.slug}`,
        description: p.description || p.metaDescription || `Professional AI prompt for ${p.model}`,
        pubDate: p.createdAt,
        image: p.image || p.images?.split(',')[0]
      })),
      ...posts.map(p => ({
        title: p.title,
        link: `${baseUrl}/${lang}/blog/${p.slug}`,
        description: p.excerpt || p.metaDescription || 'Latest AI news and guides',
        pubDate: p.createdAt,
        image: p.image
      })),
      ...scripts.map(s => ({
        title: s.title,
        link: `${baseUrl}/${lang}/scripts/${s.categoryData?.slug || 'general'}/${s.slug}`,
        description: s.description || s.metaDescription || `Free AI script for ${s.language}`,
        pubDate: s.createdAt,
        image: s.image
      })),
      ...threads.map(t => ({
        title: t.title,
        link: `${baseUrl}/${lang}/community/${t.slug}`,
        description: t.content.substring(0, 160) + '...',
        pubDate: t.createdAt,
        image: t.mediaUrls?.split(',')[0]
      }))
    ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const itemsXml = allItems.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      ${item.image ? `<media:content url="${item.image.startsWith('http') ? item.image : baseUrl + item.image}" medium="image" />` : ''}
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${settings.rss_feed_title}</title>
    <link>${baseUrl}</link>
    <description>${settings.rss_feed_description}</description>
    <language>${settings.rss_feed_language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
