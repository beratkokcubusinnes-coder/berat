import { getToolBySlug, getRelatedTools } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Share2, Heart, Eye, ShieldCheck, Info, Wrench, ExternalLink, Download } from "lucide-react";
import { ToolCard } from "@/components/ui/ToolCard";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import { Metadata } from 'next';
import Link from 'next/link';

import { generateSoftwareAppSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { getContentWithTranslation } from "@/lib/translations";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string; slug: string }> }): Promise<Metadata> {
    const { slug, lang } = await params;
    const toolData = await getToolBySlug(slug) as any;
    if (!toolData) return { title: 'Tool Not Found' };

    const tool = await getContentWithTranslation(toolData, 'tool', toolData.id, lang as any);

    return {
        title: `${tool.metaTitle || tool.title} | AI & Dev Utility | Promptda`,
        description: tool.metaDescription || tool.description || `Check out ${tool.title}. A powerful utility for developers by ${tool.author.name}.`,
    };
}

export default async function ToolDetailPage({
    params
}: {
    params: Promise<{ lang: string; category: string; slug: string }>;
}) {
    const { lang, category: categorySlug, slug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const rawToolData = await getToolBySlug(slug, categorySlug);
    if (!rawToolData) {
        notFound();
    }
    const tool = await getContentWithTranslation(rawToolData as any, 'tool', (rawToolData as any).id, lang as any);
    const relatedTools = await getRelatedTools(tool.categoryId, tool.id);

    // Schema Data Generation
    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Tools", item: `https://promptda.com/${lang}/tools` },
        { name: tool.categoryData?.name || "Utility", item: `https://promptda.com/${lang}/tools/${categorySlug}` },
        { name: tool.title, item: `https://promptda.com/${lang}/tools/${categorySlug}/${slug}` }
    ];

    const softwareSchema = generateSoftwareAppSchema({
        name: tool.title,
        description: tool.description,
        image: tool.image || "https://promptda.com/images/placeholder-tools.png",
        applicationCategory: tool.categoryData?.name || "DeveloperApplication",
        operatingSystem: "Web" // Or dynamically if you have this data
    });

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-12">
                    {/* Header Path/Title */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="hover:text-primary cursor-pointer transition-colors">Explorer</span>
                            <span>/</span>
                            <span className="hover:text-primary cursor-pointer transition-colors">Tools</span>
                            <span>/</span>
                            <span className="hover:text-primary cursor-pointer transition-colors">{tool.categoryData?.name || 'Utility'}</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{tool.title}</h1>
                        <p className="text-muted-foreground text-sm font-medium">Professional utility for your workflow.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Visuals & Content */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Main Image */}
                            <figure className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-border shadow-2xl animate-in zoom-in-95 duration-700">
                                <Image
                                    src={tool.image || "/images/placeholder-tools.png"}
                                    alt={tool.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                    className="object-cover"
                                    priority
                                />
                                {/* Premium Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                    <div className="bg-orange-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-orange-500/40 text-[10px] font-black uppercase tracking-tighter text-orange-500">
                                        {tool.categoryData?.name || 'General'} Tool
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black uppercase tracking-tighter text-white">
                                        Verified Tool
                                    </div>
                                </div>
                            </figure>

                            {/* Actions / Link */}
                            {tool.link && (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                    <a
                                        href={tool.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]"
                                    >
                                        <ExternalLink className="w-6 h-6" />
                                        Launch Tool
                                    </a>
                                </div>
                            )}

                            {/* Description */}
                            <article className="bg-card/50 border border-border rounded-3xl p-8 md:p-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <Info className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-black tracking-tight">About this Tool</h2>
                                </div>
                                <div className="prose prose-invert max-w-none text-muted-foreground">
                                    {tool.description || "No description provided."}
                                </div>
                                {tool.content && (
                                    <div className="mt-8 pt-8 border-t border-border/50">
                                        <h3 className="text-lg font-bold mb-4">Additional Details</h3>
                                        <div className="prose prose-invert max-w-none text-muted-foreground">
                                            {tool.content}
                                        </div>
                                    </div>
                                )}
                            </article>
                        </div>

                        {/* Right Column: Sidebar */}
                        <aside className="lg:col-span-4 space-y-8">
                            {/* Author Card */}
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl animate-in slide-in-from-right-8 duration-700">
                                <div className="flex items-center gap-4 mb-8">
                                    <UserAvatar
                                        src={tool.author.avatar}
                                        alt={tool.author.name}
                                        className="w-16 h-16 border-2 border-primary shadow-lg shadow-primary/20"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-black text-lg tracking-tight">{tool.author.name}</h3>
                                        <p className="text-xs text-muted-foreground font-bold">@{(tool.author as any).username}</p>
                                    </div>
                                    <button className="bg-primary text-white text-xs font-black px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/25">
                                        Follow
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 py-6 border-y border-border/50">
                                    <div className="text-center">
                                        <span className="block text-lg font-black">{tool.likes || 0}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Likes</span>
                                    </div>
                                    <div className="text-center border-l border-border/50">
                                        <span className="block text-lg font-black">{tool.views || 0}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Views</span>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted font-black text-sm transition-all flex items-center justify-center gap-3 group">
                                    <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    Share Tool
                                </button>
                            </div>

                            {/* Details Card */}
                            <div className="bg-card border border-border rounded-3xl overflow-hidden animate-in slide-in-from-right-12 duration-700 delay-100">
                                <div className="p-6 border-b border-border/50 bg-muted/20">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Wrench className="w-4 h-4" />
                                        Tool Info
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground">Category</span>
                                        <span className="text-sm font-black text-orange-500 px-3 py-1 bg-orange-500/10 rounded-lg">{tool.categoryData?.name || 'Utility'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-muted-foreground">Posted</span>
                                        <span className="text-sm font-black text-foreground">
                                            <time dateTime={tool.createdAt.toISOString()}>
                                                {new Date(tool.createdAt).toLocaleDateString()}
                                            </time>
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 bg-orange-500/5 border-t border-orange-500/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Available Now</span>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Footer: More Like This */}
                    <div className="pt-12 border-t border-border/50 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight">More Tools</h2>
                            <Link href={`/${lang}/tools`} className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedTools.map((t) => (
                                <ToolCard key={t.id} tool={t as any} lang={lang} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
