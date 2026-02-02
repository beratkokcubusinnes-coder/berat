"use client";
import { useState } from 'react';
import { languages, defaultLanguage } from '@/lib/i18n';
import { Loader2, Wand2 } from 'lucide-react';

interface TranslationField {
    label: string;
    name: string;
    type: 'text' | 'textarea' | 'richtext';
    placeholder?: string;
    rows?: number;
    required?: boolean;
}

interface MultiLanguageEditorProps {
    fields: TranslationField[];
    hideDefaultLanguage?: boolean;
    values: Record<string, Record<string, string>>;
    onChange: (language: string, field: string, value: string) => void;
    sourceValues?: Record<string, string>; // Values of the default language
    sourceLanguageCode?: string;
}

export function MultiLanguageEditor({
    fields,
    hideDefaultLanguage = false,
    values,
    onChange,
    sourceValues,
    sourceLanguageCode = defaultLanguage
}: MultiLanguageEditorProps) {
    const editorLanguages = hideDefaultLanguage
        ? languages.filter(l => l.code !== sourceLanguageCode)
        : languages;

    // Use a secondary state to avoid shadowing/circular issues during init
    const [activeLanguage, setActiveLanguage] = useState(
        hideDefaultLanguage ? (editorLanguages[0]?.code || 'tr') : sourceLanguageCode
    );

    const [isTranslating, setIsTranslating] = useState(false);

    const handleAutoTranslate = async () => {
        if (!sourceValues && !values[sourceLanguageCode]) {
            alert("No source content found to translate from.");
            return;
        }

        const source = sourceValues || values[sourceLanguageCode];
        if (!source) return;

        setIsTranslating(true);
        try {
            for (const field of fields) {
                const sourceText = source[field.name];

                // Only translate if source exists and target is empty (optional: force overwrite?)
                // For now, let's just translate everything that has a source.
                if (sourceText) {
                    const res = await fetch("/api/admin/seo/translate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: sourceText,
                            targetLang: activeLanguage,
                            sourceLang: sourceLanguageCode
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        onChange(activeLanguage, field.name, data.translatedText);
                    }
                }
            }
        } catch (error) {
            console.error("Translation failed", error);
            alert("Translation failed. Please try again.");
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Language Tabs */}
            <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto items-center justify-between">
                <div className="flex gap-2">
                    {editorLanguages.map((lang) => {
                        const hasContent = values[lang.code] && Object.keys(values[lang.code]).length > 0;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => setActiveLanguage(lang.code)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-medium transition-all whitespace-nowrap ${activeLanguage === lang.code
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    }`}
                                type="button"
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm">{lang.name}</span>
                                {hasContent && activeLanguage !== lang.code && (
                                    <span className="w-2 h-2 rounded-full bg-green-500" title="Has content" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {activeLanguage !== sourceLanguageCode && (sourceValues || values[sourceLanguageCode]) && (
                    <button
                        type="button"
                        onClick={handleAutoTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                        {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Auto Translate
                    </button>
                )}
            </div>

            {/* Language Hint */}
            <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">{languages.find(l => l.code === activeLanguage)?.flag}</span>
                    <div>
                        <div className="font-bold">
                            {languages.find(l => l.code === activeLanguage)?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {activeLanguage === sourceLanguageCode
                                ? '🌐 Default language - users will see this if their language is not available'
                                : '🌍 Translation - users selecting this language will see this content'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-6 bg-card border border-border rounded-2xl p-6 relative">
                {isTranslating && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="flex flex-col items-center gap-3 bg-card border border-border p-6 rounded-xl shadow-xl">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="font-bold text-sm">Translating content...</p>
                        </div>
                    </div>
                )}

                {fields.map((field) => {
                    const value = values[activeLanguage]?.[field.name] || '';

                    return (
                        <div key={field.name} className="space-y-2">
                            <label className="block text-sm font-bold">
                                {field.label}
                                {field.required && activeLanguage === sourceLanguageCode && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>

                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => onChange(activeLanguage, field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required={field.required && activeLanguage === sourceLanguageCode}
                                />
                            )}

                            {field.type === 'textarea' && (
                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(activeLanguage, field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={field.rows || 4}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required={field.required && activeLanguage === sourceLanguageCode}
                                />
                            )}

                            {field.type === 'richtext' && (
                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(activeLanguage, field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={field.rows || 10}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                    required={field.required && activeLanguage === sourceLanguageCode}
                                />
                            )}

                            {field.name.includes('meta') && (
                                <div className="text-xs text-muted-foreground">
                                    {field.name === 'metaTitle' && '📊 Recommended: 50-60 characters'}
                                    {field.name === 'metaDescription' && '📊 Recommended: 150-160 characters'}
                                    {value && (
                                        <span className="ml-2">
                                            Current: {value.length} characters
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Warning for incomplete translations */}
            {activeLanguage !== sourceLanguageCode && !values[activeLanguage]?.title && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-xl p-4 text-sm">
                    <strong>⚠️ No translation yet</strong>
                    <p className="mt-1">Users selecting {languages.find(l => l.code === activeLanguage)?.name} will see the {languages.find(l => l.code === sourceLanguageCode)?.name} version until you add a translation.</p>
                </div>
            )}
        </div>
    );
}
