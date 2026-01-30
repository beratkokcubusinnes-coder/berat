import { languages, defaultLanguage } from './i18n'

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
}

export function getSitemapUrl(path: string, lang: string, baseUrl: string) {
    const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    let finalUrl = '';

    if (lang === defaultLanguage) {
        finalUrl = `${baseUrl}${cleanPath === '' ? '/' : cleanPath}`;
    } else {
        finalUrl = `${baseUrl}/${lang}${cleanPath === '' ? '/' : cleanPath}`;
    }

    return escapeXml(finalUrl);
}

export function getCanonicalUrl(path: string, lang: string, baseUrl: string) {
    return getSitemapUrl(path, lang, baseUrl);
}

export function getSitemapAlternates(path: string, baseUrl: string) {
    const alternates: Record<string, string> = {};

    languages.forEach(lang => {
        alternates[lang.code] = getSitemapUrl(path, lang.code, baseUrl);
    });

    // Add x-default pointing to the default language version
    alternates['x-default'] = getSitemapUrl(path, defaultLanguage, baseUrl);

    return alternates;
}
