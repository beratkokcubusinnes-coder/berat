#!/usr/bin/env node

/**
 * Translation Audit Script
 * Analyzes translation completeness across all language files
 * 
 * Usage: node scripts/audit-translations.ts
 * CI Mode: node scripts/audit-translations.ts --ci
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MESSAGES_DIR = path.join(__dirname, '../messages');
const LANGUAGES = ['en', 'tr', 'de', 'es'];
const BASE_LANGUAGE = 'en';
const CI_MODE = process.argv.includes('--ci');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function colorize(text, color) {
    if (CI_MODE) return text;
    return `${color}${text}${colors.reset}`;
}

// Count all keys recursively
function countKeys(obj, prefix = '') {
    let count = 0;
    let keys = [];

    for (let key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const result = countKeys(obj[key], fullKey);
            count += result.count;
            keys = keys.concat(result.keys);
        } else {
            count++;
            keys.push(fullKey);
        }
    }

    return { count, keys };
}

// Get value by path
function getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Calculate word count
function wordCount(text) {
    if (typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Main audit function
function auditTranslations() {
    console.log(colorize('\n🔍 Translation Audit Report\n', colors.cyan + colors.bold));
    console.log('━'.repeat(80));

    const results = {};
    const baseData = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${BASE_LANGUAGE}.json`), 'utf8'));
    const baseKeys = countKeys(baseData);

    console.log(colorize(`\nBase Language (${BASE_LANGUAGE}): ${baseKeys.count} keys\n`, colors.bold));

    // Analyze each language
    LANGUAGES.forEach(lang => {
        const filePath = path.join(MESSAGES_DIR, `${lang}.json`);

        if (!fs.existsSync(filePath)) {
            results[lang] = {
                exists: false,
                keyCount: 0,
                missingKeys: baseKeys.keys,
                completeness: 0,
            };
            return;
        }

        const langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const langKeys = countKeys(langData);
        const missingKeys = [];
        const contentParity = [];

        // Check for missing keys and content parity
        baseKeys.keys.forEach(key => {
            const baseValue = getValueByPath(baseData, key);
            const langValue = getValueByPath(langData, key);

            if (langValue === undefined || langValue === null) {
                missingKeys.push(key);
            } else if (typeof baseValue === 'string' && typeof langValue === 'string') {
                const baseWords = wordCount(baseValue);
                const langWords = wordCount(langValue);

                if (baseWords > 0) {
                    const ratio = langWords / baseWords;
                    if (ratio < 0.5) {
                        contentParity.push({
                            key,
                            ratio: (ratio * 100).toFixed(0),
                            baseWords,
                            langWords,
                        });
                    }
                }
            }
        });

        const completeness = ((baseKeys.count - missingKeys.length) / baseKeys.count * 100).toFixed(1);

        results[lang] = {
            exists: true,
            keyCount: langKeys.count,
            missingKeys,
            contentParity,
            completeness: parseFloat(completeness),
        };
    });

    // Print results table
    console.log(colorize('Language Statistics:', colors.bold));
    console.log('┌──────────┬───────────┬─────────────┬──────────────┐');
    console.log('│ Language │ Key Count │ Completeness │ Status       │');
    console.log('├──────────┼───────────┼─────────────┼──────────────┤');

    LANGUAGES.forEach(lang => {
        const result = results[lang];
        if (!result.exists) {
            console.log(`│ ${lang.padEnd(8)} │ ${'N/A'.padEnd(9)} │ ${'0%'.padEnd(12)} │ ${colorize('Missing', colors.red).padEnd(20)} │`);
            return;
        }

        const status = result.completeness === 100
            ? colorize('✓ Complete', colors.green)
            : result.completeness >= 90
                ? colorize('⚠ Good', colors.yellow)
                : colorize('✗ Incomplete', colors.red);

        console.log(`│ ${lang.padEnd(8)} │ ${String(result.keyCount).padEnd(9)} │ ${(result.completeness + '%').padEnd(12)} │ ${status.padEnd(20)} │`);
    });

    console.log('└──────────┴───────────┴─────────────┴──────────────┘\n');

    // Print missing keys
    let hasIssues = false;
    LANGUAGES.forEach(lang => {
        const result = results[lang];

        if (result.missingKeys && result.missingKeys.length > 0) {
            hasIssues = true;
            console.log(colorize(`\n❌ Missing keys in ${lang} (${result.missingKeys.length}):`, colors.red + colors.bold));
            result.missingKeys.slice(0, 10).forEach(key => {
                console.log(`   - ${key}`);
            });
            if (result.missingKeys.length > 10) {
                console.log(colorize(`   ... and ${result.missingKeys.length - 10} more`, colors.yellow));
            }
        }

        if (result.contentParity && result.contentParity.length > 0) {
            hasIssues = true;
            console.log(colorize(`\n⚠️  Content parity issues in ${lang} (${result.contentParity.length}):`, colors.yellow + colors.bold));
            result.contentParity.slice(0, 5).forEach(item => {
                console.log(`   - ${item.key}: ${item.langWords}/${item.baseWords} words (${item.ratio}%)`);
            });
            if (result.contentParity.length > 5) {
                console.log(colorize(`   ... and ${result.contentParity.length - 5} more`, colors.yellow));
            }
        }
    });

    // Summary
    console.log('\n' + '━'.repeat(80));
    console.log(colorize('\n📊 Summary\n', colors.cyan + colors.bold));

    const avgCompleteness = LANGUAGES.reduce((sum, lang) =>
        sum + (results[lang]?.completeness || 0), 0) / LANGUAGES.length;

    console.log(`Average Completeness: ${avgCompleteness.toFixed(1)}%`);
    console.log(`Languages at 100%: ${LANGUAGES.filter(l => results[l]?.completeness === 100).join(', ') || 'None'}`);
    console.log(`Languages needing work: ${LANGUAGES.filter(l => (results[l]?.completeness || 0) < 100).join(', ') || 'None'}\n`);

    // Save JSON report
    const reportPath = path.join(__dirname, '../translation-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(colorize(`\n✓ Detailed report saved: ${reportPath}\n`, colors.green));

    // Exit code for CI
    if (CI_MODE && hasIssues) {
        console.error(colorize('Translation audit failed: Issues detected', colors.red));
        process.exit(1);
    }

    if (!hasIssues) {
        console.log(colorize('✓ All translations are complete!\n', colors.green + colors.bold));
    }
}

// Run audit
try {
    auditTranslations();
} catch (error) {
    console.error(colorize(`\n❌ Error running audit: ${error.message}\n`, colors.red));
    if (CI_MODE) {
        process.exit(1);
    }
}
