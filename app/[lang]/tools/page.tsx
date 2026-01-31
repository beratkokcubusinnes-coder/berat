import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getTools } from "@/lib/db";
import { ToolCard } from "@/components/ui/ToolCard";
import { Wrench, Search, Filter, Cpu, Zap } from "lucide-react";
import { getContentWithTranslation } from "@/lib/translations";
import { Metadata } from "next";
import Link from "next/link";
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo";
import { getSitemapAlternates, getCanonicalUrl } from "@/lib/sitemap-utils";
import { getPageSeo } from "@/lib/seo-settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const seo = await getPageSeo("Tools", lang);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/tools';

    return {
        title: seo.title,
        description: seo.description,
        alternates: {
            canonical: getCanonicalUrl(path, lang, baseUrl),
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function ToolsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ category?: string; sort?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    // Fetch dynamic tools from database
    const toolsData = await getTools();
    const tools = await Promise.all(
        toolsData.map(tool => getContentWithTranslation(tool, 'tool', tool.id, lang as any))
    );

    // SEO Data
    const collectionSchema = generateCollectionPageSchema(
        "AI Tools Library",
        "Discover powerful AI tools and resources curated for productivity and development.",
        `https://promptda.com/${lang}/tools`
    );

    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Tools", item: `https://promptda.com/${lang}/tools` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

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
                        tools.map((t: any) => {
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
                            return {
                                name: t.title,
                                url: `${baseUrl}/${lang}/tools/${t.categoryData?.slug || 'general'}/${t.slug}`,
                                image: t.image
                            };
                        }),
                        "Tools Library"
                    ))
                }}
            />

            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-12 max-w-[1920px] mx-auto pb-24">
                    {/* Premium Header Section */}
                    <section className="relative p-12 overflow-hidden rounded-[40px] bg-gradient-to-br from-orange-500/10 via-background to-background border border-orange-500/10">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/20 text-xs font-black uppercase tracking-widest">
                                <Wrench className="w-3.5 h-3.5" />
                                Curated AI Ecosystem
                            </div>
                            {/* Breadcrumb Visual */}
                            <nav className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-12 right-12 hidden md:block">
                                <Link href={`/${lang}`} className="hover:text-orange-500 transition-colors">Home</Link>
                                <span className="mx-2">/</span>
                                <span className="text-foreground">Tools</span>
                            </nav>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                                Powerful AI <span className="text-orange-500 italic">Tools</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                Accelerate your workflow with the best AI-powered tools and utilities. From image generation to code automation, find everything you need.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    </section>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search tools..."
                                    className="bg-card border border-border rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all w-64 md:w-80"
                                />
                            </div>
                            <div className="h-10 w-px bg-border/50 hidden md:block" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{tools.length}</span> Tools Found
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl text-sm font-bold hover:border-orange-500 transition-all">
                                <Filter className="w-4 h-4" />
                                All Categories
                            </button>
                        </div>
                    </div>

                    {/* Tools Grid - Fully Dynamic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {tools.map((tool: any) => (
                            <ToolCard key={tool.id} tool={tool} lang={lang} />
                        ))}

                        {tools.length === 0 && (
                            <div className="col-span-full py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                    <Wrench className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">No Tools Found</h3>
                                    <p className="text-muted-foreground">Our tool repository is currently empty. Would you like to suggest one?</p>
                                </div>
                                <Link href={`/${lang}/upload`} className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                                    Submit a Tool
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

