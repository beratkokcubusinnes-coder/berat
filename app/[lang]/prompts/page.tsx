import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getPrompts } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { PromptCard } from "@/components/ui/PromptCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo";
import { getPageBlocks } from "@/lib/blocks";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getSitemapAlternates } from "@/lib/sitemap-utils";

import { getContentWithTranslation } from "@/lib/translations";
import { getPageSeo } from "@/lib/seo-settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const seo = await getPageSeo("Prompts", lang);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/prompts';

    return {
        title: seo.title,
        description: seo.description,
        alternates: {
            canonical: lang === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${lang}${path}`,
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function PromptsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ category?: string; model?: string; sort?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;
    const session = await getSession();
    const { category, model, sort } = await searchParams;

    // Fetch prompts from database
    const allPromptsRawData = await getPrompts();
    let allPrompts = await Promise.all(
        allPromptsRawData.map(async (p: any) => {
            const translated = await getContentWithTranslation(p, 'prompt', p.id, lang as any);
            return {
                ...translated,
                author: translated.author || { name: "Unknown", username: "unknown", avatar: "", verified: false }
            };
        })
    );

    // Apply filters
    if (category && category !== "all") {
        allPrompts = allPrompts.filter((p: any) => p.category === category);
    }
    if (model && model !== "all") {
        allPrompts = allPrompts.filter((p: any) => p.model === model);
    }

    // Apply sorting (Default: Newest)
    if (sort === "popular") {
        allPrompts = allPrompts.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
    } else {
        // Newest is default
        allPrompts = allPrompts.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Get unique categories and models for filters
    const categories = ["all", ...new Set(allPrompts.map((p: any) => p.category))];
    const models = ["all", ...new Set(allPrompts.map((p: any) => p.model))];

    // SEO Data
    const collectionSchema = generateCollectionPageSchema(
        "AI Prompts Library",
        "Explore our curated collection of high-quality AI prompts for Midjourney, DALL-E, GPT-4, and more.",
        `https://promptda.com/${lang}/prompts`
    );

    const breadcrumbs = [
        { name: dict.Prompts.breadcrumbHome, item: `https://promptda.com/${lang}` },
        { name: dict.Prompts.breadcrumbPrompts, item: `https://promptda.com/${lang}/prompts` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    // Get page blocks
    const topBlocks = await getPageBlocks('prompts', 'top');
    const bottomBlocks = await getPageBlocks('prompts', 'bottom');

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {/* Listing Schema for Prompts */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateItemListSchema(
                        allPrompts.map((p: any) => {
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
                            return {
                                name: p.title,
                                url: `${baseUrl}/${lang}/prompt/${p.categoryData?.slug || p.category}/${p.slug}`,
                                image: p.images?.includes(',') ? p.images.split(',')[0] : p.images
                            };
                        }),
                        "AI Prompts Explorer"
                    ))
                }}
            />

            {/* Sidebar - Fixed Left */}
            <Sidebar lang={lang} dict={dict} user={session} />

            {/* Main Content Area */}
            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-8 max-w-[1920px] mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            {/* Breadcrumb Visual */}
                            <nav className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                <span className="hover:text-primary cursor-pointer transition-colors">{dict.Prompts.breadcrumbHome}</span>
                                <span className="mx-2">/</span>
                                <span className="text-foreground">{dict.Prompts.breadcrumbPrompts}</span>
                            </nav>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">{dict.Prompts.title}</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{allPrompts.length}</span> {dict.Prompts.promptsAvailable}
                            </div>
                        </div>
                    </div>

                    {/* Top Blocks */}
                    <BlockRenderer blocks={topBlocks} />

                    {/* Filters */}
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <FilterBar
                            categories={categories as string[]}
                            models={models as string[]}
                            currentCategory={category}
                            currentModel={model}
                            currentSort={sort}
                            lang={lang}
                            dict={dict}
                        />
                    </div>

                    {/* Prompts Grid */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-900">
                        {allPrompts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {allPrompts.map((prompt: any) => (
                                    <PromptCard key={prompt.id} prompt={prompt} lang={lang} dict={dict} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
                                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">{dict.Prompts.noPromptsFound}</h3>
                                <p className="text-muted-foreground">{dict.Prompts.noPromptsDesc}</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Blocks */}
                    <BlockRenderer blocks={bottomBlocks} />
                </main>
            </div>
        </div>
    );
}
