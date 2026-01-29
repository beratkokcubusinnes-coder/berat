"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultiLanguageEditor } from '@/components/admin/MultiLanguageEditor';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function TranslationTestPage() {
    const router = useRouter();
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
        en: {
            title: 'My Amazing AI Prompt',
            description: 'This is a great prompt for AI image generation',
            content: 'Detailed prompt content here...',
            metaTitle: 'Amazing AI Prompt | Promptda',
            metaDescription: 'Create stunning AI images with this professional prompt',
            seoContent: 'Additional SEO text for search engines...',
        },
        tr: {},
        de: {},
        es: {},
    });

    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);

        try {
            // 1. Önce içeriği kaydet (örnek)
            const contentRes = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: 'test-prompt-' + Date.now(),
                    title: translations.en.title,
                    description: translations.en.description,
                    content: translations.en.content,
                }),
            });

            if (!contentRes.ok) throw new Error('Failed to create content');

            const content = await contentRes.json();

            // 2. Çevirileri kaydet
            const translationRes = await fetch('/api/translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentType: 'prompt',
                    contentId: content.id,
                    translations: translations,
                }),
            });

            if (!translationRes.ok) throw new Error('Failed to save translations');

            alert('✅ Content and translations saved successfully!');
            router.push('/en/admin/translations/test');
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Error saving: ' + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/en/admin"
                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Multi-Language Content Test</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            YouTube-style translation interface demo
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h2 className="font-bold text-lg mb-2">🎬 How It Works</h2>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>1. Click on language tabs to switch between languages</li>
                        <li>2. English is the default language (required)</li>
                        <li>3. Fill in translations for other languages (optional)</li>
                        <li>4. Users will see content in their selected language</li>
                        <li>5. If translation is missing, they see English (fallback)</li>
                    </ul>
                </div>

                {/* Multi-Language Editor */}
                <MultiLanguageEditor
                    fields={[
                        {
                            label: 'Title',
                            name: 'title',
                            type: 'text',
                            placeholder: 'Enter the title',
                            required: true,
                        },
                        {
                            label: 'Description',
                            name: 'description',
                            type: 'textarea',
                            placeholder: 'Short description of the content',
                            rows: 4,
                        },
                        {
                            label: 'Content',
                            name: 'content',
                            type: 'richtext',
                            placeholder: 'Main content (HTML allowed)',
                            rows: 10,
                        },
                        {
                            label: 'Meta Title (SEO)',
                            name: 'metaTitle',
                            type: 'text',
                            placeholder: 'SEO title (50-60 characters)',
                        },
                        {
                            label: 'Meta Description (SEO)',
                            name: 'metaDescription',
                            type: 'textarea',
                            placeholder: 'SEO description (150-160 characters)',
                            rows: 2,
                        },
                        {
                            label: 'SEO Content',
                            name: 'seoContent',
                            type: 'textarea',
                            placeholder: 'Additional SEO text for search engines',
                            rows: 4,
                        },
                    ]}

                    values={translations}
                    onChange={(lang, field, value) => {
                        setTranslations(prev => ({
                            ...prev,
                            [lang]: {
                                ...prev[lang],
                                [field]: value,
                            },
                        }));
                    }}
                />

                {/* Debug Info */}
                <details className="bg-muted/30 border border-border rounded-2xl p-4">
                    <summary className="cursor-pointer font-bold">
                        🔍 Debug: Translation Data
                    </summary>
                    <pre className="mt-4 text-xs overflow-auto">
                        {JSON.stringify(translations, null, 2)}
                    </pre>
                </details>

                {/* Save Button */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !translations.en?.title}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Content & Translations'}
                    </button>

                    <button
                        onClick={() => {
                            setTranslations({
                                en: {},
                                tr: {},
                                de: {},
                                es: {},
                            });
                        }}
                        className="px-6 py-3 border border-border rounded-2xl hover:bg-muted transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
}
