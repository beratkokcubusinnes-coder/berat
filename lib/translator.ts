/**
 * Simple Free Translation Utility using Google Translate API (GTX)
 */

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text) return "";

    // Check if the text is a JSON structure (Block System)
    const isJson = (text.trim().startsWith('[') && text.trim().endsWith(']')) ||
        (text.trim().startsWith('{') && text.trim().endsWith('}'));

    if (isJson) {
        try {
            const blocks = JSON.parse(text);
            if (Array.isArray(blocks)) {
                const translatedBlocks = await Promise.all(blocks.map(async (block: any) => {
                    // Translate standard block content
                    if (block.content && typeof block.content === 'string') {
                        block.content = await translateText(block.content, targetLanguage);
                    }
                    // Translate HowTo block specific fields
                    if (block.type === 'Howto' && block.content && typeof block.content === 'object') {
                        if (block.content.name) block.content.name = await translateText(block.content.name, targetLanguage);
                        if (block.content.steps && Array.isArray(block.content.steps)) {
                            block.content.steps = await Promise.all(block.content.steps.map(async (step: any) => ({
                                title: await translateText(step.title, targetLanguage),
                                text: await translateText(step.text, targetLanguage)
                            })));
                        }
                    }
                    return block;
                }));
                return JSON.stringify(translatedBlocks);
            }
        } catch (e) {
            // If JSON parsing fails, fall back to normal translation
            console.warn("Failed to parse JSON for translation, falling back to raw translation", e);
        }
    }

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data[0]) {
            return data[0].map((part: any) => part[0]).join("");
        }

        return text;
    } catch (error) {
        console.error(`Translation failed for ${targetLanguage}:`, error);
        return text;
    }
}
