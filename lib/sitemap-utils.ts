import { languages, defaultLanguage } from './i18n'

export function getSitemapUrl(path: string, lang: string, baseUrl: string) {
    const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

    if (lang === defaultLanguage) {
        return `${baseUrl}${cleanPath === '' ? '/' : cleanPath}`;
    }
    return `${baseUrl}/${lang}${cleanPath === '' ? '/' : cleanPath}`;
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
