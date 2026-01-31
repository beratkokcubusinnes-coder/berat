import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getScripts } from "@/lib/db";
import { ScriptCard } from "@/components/ui/ScriptCard";
import { Code2, Search, Filter, Terminal, Cpu } from "lucide-react";
import { getContentWithTranslation } from "@/lib/translations";
import { Metadata } from "next";

import Link from "next/link";
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo";
import { getPageBlocks } from "@/lib/blocks";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

import { getSitemapAlternates, getCanonicalUrl } from "@/lib/sitemap-utils";

import { getPageSeo } from "@/lib/seo-settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    // Fetch dynamic SEO settings (with fallback to dictionary)
    const seo = await getPageSeo('Scripts', lang);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/scripts';

    return {
        title: seo.title,
        description: seo.description,
        alternates: {
            canonical: getCanonicalUrl(path, lang, baseUrl),
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function ScriptsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ language?: string; sort?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    // Fetch dynamic scripts from database
    const scriptsData = await getScripts();
    const scripts = await Promise.all(
        scriptsData.map(script => getContentWithTranslation(script, 'script', script.id, lang as any))
    );

    // SEO Data
    const collectionSchema = generateCollectionPageSchema(
        "Scripts Library",
        "Explore our curated collection of useful scripts for development, automation, and AI integration.",
        `https://promptda.com/${lang}/scripts`
    );

    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Scripts", item: `https://promptda.com/${lang}/scripts` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    const topBlocks = await getPageBlocks('scripts', 'top');
    const bottomBlocks = await getPageBlocks('scripts', 'bottom');

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateItemListSchema(
                        scripts.map((s: any) => {
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
                            return {
                                name: s.title,
                                url: `${baseUrl}/${lang}/scripts/${s.categoryData?.slug || 'general'}/${s.slug}`,
                                image: s.image
                            };
                        }),
                        "Scripts Library"
                    ))
                }}
            />

            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-12 max-w-[1920px] mx-auto pb-24">
                    <BlockRenderer blocks={topBlocks} />

                    {/* Premium Header Section */}
                    <section className="relative p-12 overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-500/10 via-background to-background border border-blue-500/10">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/20 text-xs font-black uppercase tracking-widest">
                                <Code2 className="w-3.5 h-3.5" />
                                Interactive Code Library
                            </div>
                            {/* Breadcrumb Visual */}
                            <nav className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-12 right-12 hidden md:block">
                                <Link href={`/${lang}`} className="hover:text-blue-500 transition-colors">Home</Link>
                                <span className="mx-2">/</span>
                                <span className="text-foreground">Scripts</span>
                            </nav>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                                AI & Automation <span className="text-blue-500 italic">Scripts</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                Professional grade development scripts, automation workflows, and AI integration tools. Boost your engineering efficiency.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    </section>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search scripts..."
                                    className="bg-card border border-border rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 md:w-80"
                                />
                            </div>
                            <div className="h-10 w-px bg-border/50 hidden md:block" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{scripts.length}</span> Scripts Found
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl text-sm font-bold hover:border-blue-500 transition-all">
                                <Filter className="w-4 h-4" />
                                Filter By Language
                            </button>
                        </div>
                    </div>

                    {/* Scripts Grid - Now Fully Dynamic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {scripts.map((script: any) => (
                            <ScriptCard key={script.id} script={script} lang={lang} />
                        ))}

                        {scripts.length === 0 && (
                            <div className="col-span-full py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                    <Code2 className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">No Scripts Found</h3>
                                    <p className="text-muted-foreground">Check back later or start by adding your own script.</p>
                                </div>
                                <Link href={`/${lang}/upload`} className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20">
                                    Submit a Script
                                </Link>
                            </div>
                        )}
                    </div>

                    <BlockRenderer blocks={bottomBlocks} />
                </main>
            </div>
        </div>
    );
}

