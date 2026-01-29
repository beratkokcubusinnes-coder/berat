import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/_next/',
                    '/settings/',
                    '/login',
                    '/register',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/settings/'],
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/prompts-sitemap.xml`,
            `${baseUrl}/scripts-sitemap.xml`,
            `${baseUrl}/hooks-sitemap.xml`,
            `${baseUrl}/tools-sitemap.xml`,
            `${baseUrl}/blog-sitemap.xml`,
            `${baseUrl}/community-sitemap.xml`,
            `${baseUrl}/members-sitemap.xml`,
            `${baseUrl}/categories-sitemap.xml`,
        ],
    }
}
