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
                    '/*?filter=',
                    '/*?sort=',
                    '/*?page=',
                    '/*/search?',
                    '/*/tag/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/settings/',
                    '/*?filter=',
                    '/*?sort=',
                    '/*?page=',
                    '/*/search?',
                    '/*/tag/',
                ],
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/sitemap_index.xml`,
        ],
    }
}
