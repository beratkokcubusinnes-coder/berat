import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getPrompts, getPromptsCount, getPromptModels, getCategoriesByType } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { PromptCard } from "@/components/ui/PromptCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo";
import { getPageBlocks } from "@/lib/blocks";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getSitemapAlternates } from "@/lib/sitemap-utils";

import { getContentWithTranslation } from "@/lib/translations";
import { getPageSeo } from "@/lib/seo-settings";

import { constructMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const seo = await getPageSeo("Prompts", lang);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/prompts';

    return constructMetadata({
        title: seo.rawTitle,
        description: seo.description,
        image: seo.image,
        noIndex: !seo.shouldIndex,
        alternates: {
            canonical: lang === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${lang}${path}`,
            languages: getSitemapAlternates(path, baseUrl)
        }
    });
}

export default async function PromptsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ category?: string; model?: string; sort?: string; page?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;
    const session = await getSession();
    const { category, model, sort, page } = await searchParams;

    const currentPage = Number(page) || 1;
    const limit = 20;
    const skip = (currentPage - 1) * limit;

    // Fetch prompts, total count, models and categories in parallel
    const [promptsRawData, totalPrompts, availableModels, availableCategories] = await Promise.all([
        getPrompts(limit, skip, category, model),
        getPromptsCount(category, model),
        getPromptModels(),
        getCategoriesByType('prompt')
    ]);

    // Handle translations for the paginated set
    let activePrompts = await Promise.all(
        promptsRawData.map(async (p: any) => {
            const translated = await getContentWithTranslation(p, 'prompt', p.id, lang as any);
            return {
                ...translated,
                author: translated.author || { name: "Unknown", username: "unknown", avatar: "", verified: false }
            };
        })
    );

    // Filter Logic for Sidebar/FilterBar
    const categoriesList = ["all", ...availableCategories.map(c => (c as any).slug || c.name)];
    const modelsList = ["all", ...availableModels];

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

    const totalPages = Math.ceil(totalPrompts / limit);

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
                        activePrompts.map((p: any) => {
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
                                <span className="font-black text-foreground">{totalPrompts}</span> {dict.Prompts.promptsAvailable}
                            </div>
                        </div>
                    </div>

                    {/* Top Blocks */}
                    <BlockRenderer blocks={topBlocks} />

                    {/* Filters */}
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <FilterBar
                            categories={categoriesList}
                            models={modelsList as string[]}
                            currentCategory={category}
                            currentModel={model}
                            currentSort={sort}
                            lang={lang}
                            dict={dict}
                        />
                    </div>

                    {/* Prompts Grid */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-900">
                        {activePrompts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {activePrompts.map((prompt: any) => (
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

                    {/* Pagination */}
                    <Pagination totalPages={totalPages} currentPage={currentPage} />

                    {/* Bottom Blocks */}
                    <BlockRenderer blocks={bottomBlocks} />
                </main>
            </div>
        </div>
    );
}
