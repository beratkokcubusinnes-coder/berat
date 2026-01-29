import { languages, defaultLanguage } from './i18n'

export function getSitemapUrl(path: string, lang: string, baseUrl: string) {
    if (lang === defaultLanguage) {
        return `${baseUrl}${path === '/' ? '' : path}`;
    }
    return `${baseUrl}/${lang}${path === '/' ? '' : path}`;
}

export function getSitemapAlternates(path: string, baseUrl: string) {
    const alternates: Record<string, string> = {};

    languages.forEach(lang => {
        alternates[lang.code] = getSitemapUrl(path, lang.code, baseUrl);
    });

    // Add x-default
    alternates['x-default'] = getSitemapUrl(path, defaultLanguage, baseUrl);

    return alternates;
}
