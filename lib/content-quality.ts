import { defaultLanguage } from "./i18n";

interface ContentQualityResult {
    shouldIndex: boolean;
    reason?: string;
    completeness: number;
    wordCount: number;
    parityRatio: number;
}

/**
 * Calculate word count for a given text
 */
export function countWords(text: string | null | undefined): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Detect placeholder content in text
 */
export function hasPlaceholderContent(text: string): boolean {
    if (!text) return true;

    // Common placeholder patterns
    const placeholders = [
        /^lorem ipsum/i,
        /^tbd/i,
        /^todo/i,
        /\[translation needed\]/i,
        /\[translate\]/i,
        /^insert content/i,
        /^sample text/i
    ];

    return placeholders.some(pattern => pattern.test(text));
}

/**
 * Check if content is sufficient for indexing
 * Parity check compares target language content length vs source (English)
 */
export async function analyzeContentQuality(
    content: { title?: string; description?: string;[key: string]: any },
    lang: string,
    enContent?: { title?: string; description?: string;[key: string]: any }
): Promise<ContentQualityResult> {
    const titleWords = countWords(content.title);
    const descWords = countWords(content.description);
    const totalWords = titleWords + descWords;

    // 1. Basic length check
    if (totalWords < 5) {
        return {
            shouldIndex: false,
            reason: `Content too short (${totalWords} words)`,
            completeness: 0,
            wordCount: totalWords,
            parityRatio: 0
        };
    }

    // 2. Placeholder check
    if (hasPlaceholderContent(content.title || '') || hasPlaceholderContent(content.description || '')) {
        return {
            shouldIndex: false,
            reason: "Placeholder content detected",
            completeness: 0,
            wordCount: totalWords,
            parityRatio: 0
        };
    }

    // 3. Parity Check (compare with English)
    if (lang !== defaultLanguage && enContent) {
        const enTitleWords = countWords(enContent.title);
        const enDescWords = countWords(enContent.description);
        const enTotalWords = enTitleWords + enDescWords;

        if (enTotalWords > 0) {
            const ratio = totalWords / enTotalWords;

            // If translation is significantly shorter (< 40% of original), it might be incomplete
            if (ratio < 0.4) {
                return {
                    shouldIndex: false,
                    reason: `Low content parity (${Math.round(ratio * 100)}% of source)`,
                    completeness: ratio * 100,
                    wordCount: totalWords,
                    parityRatio: ratio
                };
            }

            return {
                shouldIndex: true,
                completeness: ratio * 100,
                wordCount: totalWords,
                parityRatio: ratio
            };
        }
    }

    return {
        shouldIndex: true,
        completeness: 100,
        wordCount: totalWords,
        parityRatio: 1
    };
}
