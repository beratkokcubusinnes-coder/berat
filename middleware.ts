import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'de', 'es', 'tr'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Ensure the locale is always present in the URL
    localePrefix: 'as-needed'
});

export const config = {
    // Match only internationalized pathnames, but exclude API and static files
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    ]
};

// Middleware wrapper to handle Cloudflare headers if needed,
// strictly speaking next-intl handles the locale part, but for "trusting proxy"
// Next.js usually handles X-Forwarded-Host automatically.
// However, ensuring headers are preserved is key.
