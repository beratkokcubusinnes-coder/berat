/**
 * Translation Validator Utility
 * Provides functions to validate translation quality and detect issues.
 */

interface ValidationResult {
    isValid: boolean;
    score: number; // 0-100
    issues: string[];
    isMachineTranslated?: boolean;
}

export function validateTranslation(
    sourceText: string,
    targetText: string,
    targetLang: string
): ValidationResult {
    const issues: string[] = [];
    let score = 100;

    if (!sourceText || !targetText) {
        return { isValid: false, score: 0, issues: ['Missing content'] };
    }

    // 1. Length Ratio Check
    const sourceWords = sourceText.trim().split(/\s+/).length;
    const targetWords = targetText.trim().split(/\s+/).length;

    // Turkish often has fewer words (agglutinative), German often fewer (compound words), Spanish similar/more.
    // We allow a flexible range but flag extremes.
    const ratio = targetWords / sourceWords;

    if (ratio < 0.3) {
        issues.push('Translation seems too short');
        score -= 30;
    } else if (ratio > 3.0) {
        issues.push('Translation seems too long');
        score -= 10;
    }

    // 2. Variable Preservation Check ({name}, {count}, etc.)
    const sourceVars = sourceText.match(/\{[^}]+\}/g) || [];
    const targetVars = targetText.match(/\{[^}]+\}/g) || [];

    const missingVars = sourceVars.filter(v => !targetVars.includes(v));
    if (missingVars.length > 0) {
        issues.push(`Missing variables: ${missingVars.join(', ')}`);
        score -= 40; // Critical error
    }

    // 3. Placeholder Detection
    if (/lorem ipsum/i.test(targetText)) {
        issues.push('Lorem Ipsum detected');
        score -= 50;
    }

    if (/\[TODO\]|\[FIXME\]/i.test(targetText)) {
        issues.push('Dev comments detected');
        score -= 50;
    }

    // 4. Case Preservation (Start of sentence)
    const sourceStartCap = /^[A-Z]/.test(sourceText);
    const targetStartCap = /^[A-Z]/.test(targetText);
    // Ignore for scripts/codes
    if (sourceStartCap && !targetStartCap && /[a-z]/.test(targetText[0])) {
        // Warning only, some langs might differ or it's a design choice
        // score -= 5;
    }

    // 5. Detect potential machine translation artifacts
    // (This is heuristic and basic)
    let isMachineTranslated = false;
    if (ratio > 0.9 && ratio < 1.1 && sourceWords > 10) {
        // Very similar word count might indicate literal translation for some pairs, but not conclusive
    }

    return {
        isValid: score > 60,
        score: Math.max(0, score),
        issues,
        isMachineTranslated
    };
}

/**
 * Suggest improvements for a translation
 */
export function suggestImprovements(source: string, target: string): string[] {
    // Placeholder for AI-powered suggestions
    // In a real implementation, this could call an LLM API
    return [];
}
