import { getPromptBySlug, getRelatedPrompts } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Share2, Heart, Eye, ShieldCheck, Info, MessageSquare, Download } from "lucide-react";
import { CopyPrompt } from "@/components/ui/CopyPrompt";
import { PromptSEO } from "@/components/seo/PromptSEO";
import { PromptCard } from "@/components/ui/PromptCard";
import { BlockRenderer } from "@/components/ui/BlockRenderer";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import { Metadata } from 'next';

import Link from 'next/link';
import { generateBreadcrumbSchema, generatePromptProductSchema } from "@/lib/seo";
import { getContentWithTranslation } from "@/lib/translations";
import { AuthorCard } from "@/components/ui/AuthorCard";

import { getSitemapAlternates } from "@/lib/sitemap-utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string; slug: string }> }): Promise<Metadata> {
    const { slug, lang, category } = await params;
    const promptData = await getPromptBySlug(slug) as any;
    if (!promptData) return { title: 'Prompt Not Found' };

    const prompt = await getContentWithTranslation(promptData, 'prompt', promptData.id, lang as any);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = `/prompt/${category}/${slug}`;

    return {
        title: `${prompt.metaTitle || prompt.title} | AI Prompt for ${prompt.model}`,
        description: prompt.metaDescription || `Get this high-quality ${prompt.categoryData?.name || prompt.category} prompt for ${prompt.model}. Created by ${prompt.author.name}. Explore more AI prompts on Promptda.`,
        openGraph: {
            images: [prompt.images.split(',')[0]],
        },
        alternates: {
            canonical: `https://promptda.com/${lang}${path}`,
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function PromptDetailPage({
    params
}: {
    params: Promise<{ lang: string; category: string; slug: string }>;
}) {
    const { lang, category: categorySlug, slug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const rawPromptData = await getPromptBySlug(slug, categorySlug);

    if (!rawPromptData) {
        notFound();
    }

    const prompt = await getContentWithTranslation(rawPromptData as any, 'prompt', (rawPromptData as any).id, lang as any);

    // Safety check: ensure category matches (optional but good for SEO consistency)
    // if (prompt.categoryData?.slug !== categorySlug) {
    //     notFound();
    // }

    const relatedPrompts = await getRelatedPrompts(prompt.categoryId, prompt.id);

    // Schema Data Generation
    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Prompts", item: `https://promptda.com/${lang}/prompts` },
        { name: prompt.categoryData?.name || prompt.category, item: `https://promptda.com/${lang}/prompt/${categorySlug}` },
        { name: prompt.title, item: `https://promptda.com/${lang}/prompt/${categorySlug}/${slug}` }
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    // Product/CreativeWork Schema for SEO
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const productSchema = generatePromptProductSchema({
        name: prompt.title,
        description: prompt.metaDescription || prompt.description?.substring(0, 160),
        image: prompt.images.includes(',') ? prompt.images.split(',')[0] : prompt.images,
        url: `${baseUrl}/${lang}/prompt/${categorySlug}/${slug}`,
        authorName: prompt.author.name || 'Promptda Team',
        datePublished: prompt.createdAt.toISOString(),
        dateModified: prompt.updatedAt?.toISOString() || prompt.createdAt.toISOString(),
        aggregateRating: prompt.likes > 0 ? {
            ratingValue: Math.min(5, 3 + (prompt.likes / 50)), // Simple calculation
            reviewCount: Math.max(1, Math.floor(prompt.likes / 5))
        } : undefined
    });

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <PromptSEO prompt={prompt} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-12">
                    {/* Header Path/Title */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Link href={`/${lang}/prompts`} className="hover:text-primary cursor-pointer transition-colors">Explorer</Link>
                            <span>/</span>
                            <span className="hover:text-primary cursor-pointer transition-colors">Prompts</span>
                            <span>/</span>
                            <Link href={`/${lang}/prompt/${categorySlug}`} className="hover:text-primary cursor-pointer transition-colors">{prompt.categoryData?.name || prompt.category}</Link>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{prompt.title}</h1>
                        <p className="text-muted-foreground text-sm font-medium">Professional grade production asset for creative creators.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Visuals & Prompt */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Main Image Comparison / Gallery */}
                            <figure className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-border shadow-2xl animate-in zoom-in-95 duration-700">
                                <Image
                                    src={prompt.images.includes(',') ? prompt.images.split(',')[0] : prompt.images}
                                    alt={prompt.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                                {/* Premium Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black uppercase tracking-tighter text-white">
                                        Super-Resolution Scale: 4X
                                    </div>
                                    <div className="bg-primary/20 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/40 text-[10px] font-black uppercase tracking-tighter text-primary">
                                        Upscaled
                                    </div>
                                </div>
                            </figure>

                            {/* Prompt Box */}
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                <CopyPrompt prompt={prompt.content} title={`${prompt.model} Command`} />
                            </div>

                            {/* Detailed Description / SEO Content */}
                            <article className="bg-card/50 border border-border rounded-3xl p-8 md:p-10 space-y-8 prose prose-invert prose-headings:font-black prose-headings:tracking-tight max-w-none">
                                <div className="flex items-center gap-3 mb-6 non-prose">
                                    <Info className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-black m-0 tracking-tight">Technical Breakdown & Guide</h2>
                                </div>
                                <div className="bg-card/50 border border-border rounded-3xl p-8 md:p-10 space-y-8 prose-invert max-w-none non-prose">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Info className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-black m-0 tracking-tight">Technical Breakdown & Guide</h2>
                                    </div>

                                    <BlockRenderer content={prompt.description || "<p>No detailed guide provided for this prompt yet.</p>"} />
                                </div>
                            </article>
                        </div>

                        {/* Right Column: Sidebar */}
                        <aside className="lg:col-span-4 space-y-8">
                            {/* Author Card */}
                            <AuthorCard
                                author={prompt.author}
                                stats={{ views: prompt.views, likes: prompt.likes }}
                                currentUser={session}
                                lang={lang}
                            />

                            {/* Details Card */}
                            <div className="bg-card border border-border rounded-3xl overflow-hidden animate-in slide-in-from-right-12 duration-700 delay-100">
                                <div className="p-6 border-b border-border/50 bg-muted/20">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Compatibility
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground">Model</span>
                                        <span className="text-sm font-black text-primary px-3 py-1 bg-primary/10 rounded-lg">{prompt.model}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground">Category</span>
                                        <span className="text-sm font-black text-foreground">{prompt.categoryData?.name || prompt.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground">Version</span>
                                        <span className="text-sm font-black text-foreground">v6.1 Alpha</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Commercial License Included</span>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Footer: More Like This */}
                    <div className="pt-12 border-t border-border/50 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight">More Like This</h2>
                            <Link href={`/${lang}/prompt/${categorySlug}`} className="text-xs font-bold text-primary hover:underline">View All Category</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedPrompts.map((p) => (
                                <PromptCard key={p.id} prompt={p as any} lang={lang} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
