
const fetch = require('node-fetch');

async function testTranslation() {
    const text = "Heroic warrior with a glowing sword, cinematic lighting, 8k resolution";
    const targetLanguage = "tr";
    const sourceLanguage = "en";

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        if (data && data[0]) {
            const translated = data[0].map(part => part[0]).join("");
            console.log("Original:", text);
            console.log("Translated:", translated);
        } else {
            console.log("No translation data found in response.");
        }
    } catch (error) {
        console.error("Translation test failed:", error);
    }
}

testTranslation();
