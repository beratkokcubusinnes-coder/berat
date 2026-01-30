/**
 * Simple Free Translation Utility using Google Translate API (GTX)
 */

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text) return "";

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Google Translate GTX response format: [[["Translated Text", "Original Text", ...], ...], ...]
        if (data && data[0]) {
            return data[0].map((part: any) => part[0]).join("");
        }

        return text;
    } catch (error) {
        console.error(`Translation failed for ${targetLanguage}:`, error);
        return text; // Fallback to original text
    }
}
