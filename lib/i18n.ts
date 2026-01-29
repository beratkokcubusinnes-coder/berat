// Supported languages configuration
export const languages = [
    { code: 'en', name: 'English', locale: 'en-US', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', locale: 'tr-TR', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', locale: 'de-DE', flag: '🇩🇪' },
    { code: 'es', name: 'Español', locale: 'es-ES', flag: '🇪🇸' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

export const defaultLanguage = 'en';

// Get href for a given path and lang
export function getHref(path: string, lang: string) {
    if (lang === defaultLanguage) {
        return path === '/' ? '/' : path;
    }
    return `/${lang}${path === '/' ? '' : path}`;
}

// Get language metadata
export function getLanguage(code: string) {
    return languages.find(lang => lang.code === code) || languages[0];
}

// Generate hreflang links for a given path
export function generateHreflangs(path: string, baseUrl: string) {
    const hreflangs: Record<string, string> = {};

    languages.forEach(lang => {
        if (lang.code === defaultLanguage) {
            hreflangs[lang.code] = `${baseUrl}${path === '/' ? '' : path}`;
        } else {
            hreflangs[lang.code] = `${baseUrl}/${lang.code}${path === '/' ? '' : path}`;
        }
    });

    // x-default should point to the default language root URL
    hreflangs['x-default'] = `${baseUrl}${path === '/' ? '' : path}`;

    return hreflangs;
}

// Generate alternate links for metadata
export function generateAlternates(path: string, baseUrl: string) {
    return {
        canonical: `${baseUrl}${path}`,
        languages: generateHreflangs(path, baseUrl),
    };
}
