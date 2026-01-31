const fs = require('fs');
const path = require('path');

const langs = ['de', 'es', 'tr'];
const msgsDir = path.join(__dirname, 'messages');

const en = JSON.parse(fs.readFileSync(path.join(msgsDir, 'en.json'), 'utf8'));

langs.forEach(lang => {
    const file = path.join(msgsDir, `${lang}.json`);
    if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        let changed = false;

        // Check for missing top-level keys
        Object.keys(en).forEach(key => {
            if (!content[key]) {
                console.log(`[${lang}] Missing key: ${key}, polyfilling from EN...`);
                content[key] = en[key];
                changed = true;
            }
        });

        // Specifically check for missing SEO meta keys inside objects if needed
        // For now, top-level missing keys (like "Scripts") is the main crasher.

        if (changed) {
            fs.writeFileSync(file, JSON.stringify(content, null, 4), 'utf8');
            console.log(`[${lang}] Updated.`);
        } else {
            console.log(`[${lang}] No top-level keys missing.`);
        }
    }
});
