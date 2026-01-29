import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { languages } from '@/lib/i18n';
import { getSitemapUrl, getSitemapAlternates } from '@/lib/sitemap-utils';

export default async function categories(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

    const categories = await prisma.category.findMany({
        select: {
            slug: true,
            type: true,
            updatedAt: true
        }
    });

    const routes: MetadataRoute.Sitemap = [];

    categories.forEach(category => {
        let typePath = '';
        switch (category.type) {
            case 'prompt': typePath = 'prompt'; break;
            case 'script': typePath = 'scripts'; break;
            case 'hook': typePath = 'hooks'; break;
            case 'tool': typePath = 'tools'; break;
            default: typePath = category.type;
        }

        const path = `/${typePath}/${category.slug}`;

        languages.forEach(lang => {
            routes.push({
                url: getSitemapUrl(path, lang.code, baseUrl),
                lastModified: category.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.9,
                alternates: {
                    languages: getSitemapAlternates(path, baseUrl),
                },
            });
        });
    });

    return routes;
}
