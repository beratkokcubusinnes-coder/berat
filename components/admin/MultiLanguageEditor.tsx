"use client";

import { useState } from 'react';
import { languages, defaultLanguage } from '@/lib/i18n';

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
}

export function MultiLanguageEditor({
    fields,
    hideDefaultLanguage = false,
    values,
    onChange,
}: MultiLanguageEditorProps) {
    const editorLanguages = hideDefaultLanguage
        ? languages.filter(l => l.code !== defaultLanguage)
        : languages;

    // Use a secondary state to avoid shadowing/circular issues during init
    const [activeLanguage, setActiveLanguage] = useState(
        hideDefaultLanguage ? (editorLanguages[0]?.code || 'tr') : defaultLanguage
    );

    return (
        <div className="space-y-4">
            {/* Language Tabs */}
            <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
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

            {/* Language Hint */}
            <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">{languages.find(l => l.code === activeLanguage)?.flag}</span>
                    <div>
                        <div className="font-bold">
                            {languages.find(l => l.code === activeLanguage)?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {activeLanguage === defaultLanguage
                                ? '🌐 Default language - users will see this if their language is not available'
                                : '🌍 Translation - users selecting this language will see this content'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-6 bg-card border border-border rounded-2xl p-6">
                {fields.map((field) => {
                    const value = values[activeLanguage]?.[field.name] || '';

                    return (
                        <div key={field.name} className="space-y-2">
                            <label className="block text-sm font-bold">
                                {field.label}
                                {field.required && activeLanguage === defaultLanguage && (
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
                                    required={field.required && activeLanguage === defaultLanguage}
                                />
                            )}

                            {field.type === 'textarea' && (
                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(activeLanguage, field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={field.rows || 4}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required={field.required && activeLanguage === defaultLanguage}
                                />
                            )}

                            {field.type === 'richtext' && (
                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(activeLanguage, field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={field.rows || 10}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                    required={field.required && activeLanguage === defaultLanguage}
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
            {activeLanguage !== defaultLanguage && !values[activeLanguage]?.title && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-xl p-4 text-sm">
                    <strong>⚠️ No translation yet</strong>
                    <p className="mt-1">Users selecting {languages.find(l => l.code === activeLanguage)?.name} will see the {languages.find(l => l.code === defaultLanguage)?.name} version until you add a translation.</p>
                </div>
            )}
        </div>
    );
}
