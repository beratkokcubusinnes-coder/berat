import { MetadataRoute } from 'next';

export function generateSitemapXml(routes: MetadataRoute.Sitemap) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    routes.forEach((route) => {
        xml += `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified instanceof Date ? route.lastModified.toISOString() : route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency || 'weekly'}</changefreq>
    <priority>${route.priority || 0.5}</priority>`;

        if (route.alternates?.languages) {
            Object.entries(route.alternates.languages).forEach(([lang, url]) => {
                xml += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`;
            });
        }

        xml += `
  </url>`;
    });

    xml += `
</urlset>`;
    return xml;
}

export function generateSitemapIndexXml(sitemaps: string[]) {
    const lastMod = new Date().toISOString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    sitemaps.forEach((url) => {
        xml += `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`;
    });

    xml += `
</sitemapindex>`;
    return xml;
}
