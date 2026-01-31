
import { NextResponse } from 'next/server';

export async function GET() {
    // This RSS feel is optimized for SEO Discovery, not just reading.
    // It includes full content to help Google index faster.

    // In a real app, you fetch posts from DB.
    // const posts = await prisma.post.findMany(...)

    // Placeholder XML
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Promptda - Premium AI Prompts & Scripts</title>
  <link>https://promptda.com</link>
  <description>Latest AI prompts, scripts and engineering guides.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="https://promptda.com/rss.xml" rel="self" type="application/rss+xml" />
  
  <item>
    <title>Example AI Prompt Guide</title>
    <link>https://promptda.com/blog/example-post</link>
    <guid>https://promptda.com/blog/example-post</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description><![CDATA[Learn how to craft efficient AI prompts...]]></description>
    <content:encoded><![CDATA[<p>Full article content goes here for better SEO discovery...</p>]]></content:encoded>
    <media:content url="https://promptda.com/og-image.jpg" medium="image" />
  </item>
</channel>
</rss>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
