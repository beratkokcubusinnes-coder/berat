import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'de', 'es', 'tr'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Ensure the locale is always present in the URL
    localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
    const host = request.headers.get('host');
    const searchParams = request.nextUrl.search;

    // Redirect WWW to Non-WWW
    if (host?.startsWith('www.')) {
        const newHost = host.replace('www.', '');
        return NextResponse.redirect(
            `https://${newHost}${request.nextUrl.pathname}${searchParams}`,
            301
        );
    }

    return intlMiddleware(request);
}

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
