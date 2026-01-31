


export async function submitToIndexNow(urls: string[]) {
    // Check if enabled in settings (assuming we add a setting for this)
    // For now, let's assume it's enabled if we call this.

    // IndexNow API Endpoint
    const endpoint = "https://api.indexnow.org/indexnow";

    // Get host from env or settings
    const host = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : "promptda.com";

    // We need a key. Usually this is a static file at root.
    // For dynamic usage, we should store this key in settings or env.
    // Let's assume user will set `INDEXNOW_KEY` in env or we generate one.
    const key = process.env.INDEXNOW_KEY || "e4c5f6g7h8i9j0k1l2m3n4o5p6"; // Placeholder fallback

    const body = {
        host: host,
        key: key,
        keyLocation: `https://${host}/${key}.txt`, // Setup route for this
        urlList: urls
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            console.log(`IndexNow submitted successfully for ${urls.length} URLs.`);
            return { success: true };
        } else {
            console.error(`IndexNow submission failed: ${response.status} ${response.statusText}`);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.error("IndexNow error:", error);
        return { success: false, error: String(error) };
    }
}
