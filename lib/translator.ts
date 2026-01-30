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
                    const type = block.type?.toLowerCase();

                    // 1. Text content blocks (paragraph, h1, h2, h3)
                    if (["paragraph", "h1", "h2", "h3"].includes(type) && typeof block.content === 'string') {
                        block.content = await translateText(block.content, targetLanguage);
                    }

                    // 2. FAQ block
                    else if (type === "faq" && block.content?.items) {
                        block.content.items = await Promise.all(block.content.items.map(async (item: any) => ({
                            ...item,
                            question: await translateText(item.question, targetLanguage),
                            answer: await translateText(item.answer, targetLanguage)
                        })));
                    }

                    // 3. How-to block
                    else if (type === "howto" && block.content) {
                        if (block.content.name) block.content.name = await translateText(block.content.name, targetLanguage);
                        if (block.content.steps) {
                            block.content.steps = await Promise.all(block.content.steps.map(async (step: any) => ({
                                ...step,
                                title: await translateText(step.title, targetLanguage),
                                text: await translateText(step.text, targetLanguage)
                            })));
                        }
                    }

                    // 4. Review block
                    else if (type === "review" && block.content) {
                        if (block.content.itemName) block.content.itemName = await translateText(block.content.itemName, targetLanguage);
                        if (block.content.text) block.content.text = await translateText(block.content.text, targetLanguage);
                        if (block.content.author) block.content.author = await translateText(block.content.author, targetLanguage);
                    }

                    // 5. List block
                    else if (type === "list" && Array.isArray(block.content?.items)) {
                        block.content.items = await Promise.all(block.content.items.map((item: any) => translateText(item, targetLanguage)));
                    }

                    // 6. Quote block
                    else if (type === "quote" && block.content) {
                        if (block.content.text) block.content.text = await translateText(block.content.text, targetLanguage);
                        if (block.content.author) block.content.author = await translateText(block.content.author, targetLanguage);
                    }

                    // 7. Table block
                    else if (type === "table" && block.content) {
                        if (Array.isArray(block.content.headers)) {
                            block.content.headers = await Promise.all(block.content.headers.map((h: any) => translateText(h, targetLanguage)));
                        }
                        if (Array.isArray(block.content.rows)) {
                            block.content.rows = await Promise.all(block.content.rows.map(async (row: any) =>
                                Promise.all(row.map((cell: any) => translateText(cell, targetLanguage)))
                            ));
                        }
                    }

                    // 8. Callout block
                    else if (type === "callout" && block.content) {
                        if (block.content.text) block.content.text = await translateText(block.content.text, targetLanguage);
                    }

                    // 9. Image / Gallery captions
                    else if (type === "image" && block.content) {
                        if (block.content.alt) block.content.alt = await translateText(block.content.alt, targetLanguage);
                        if (block.content.caption) block.content.caption = await translateText(block.content.caption, targetLanguage);
                    }
                    else if (type === "gallery" && Array.isArray(block.content?.items)) {
                        block.content.items = await Promise.all(block.content.items.map(async (item: any) => ({
                            ...item,
                            caption: item.caption ? await translateText(item.caption, targetLanguage) : undefined
                        })));
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
