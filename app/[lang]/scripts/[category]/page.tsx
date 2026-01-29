import { getScriptsByCategory } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSession } from "@/lib/session";
import { ScriptCard } from "@/components/ui/ScriptCard";
import { Code2, Search, Filter } from "lucide-react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { getCategoryBlocks } from "@/lib/blocks";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string }> }): Promise<Metadata> {
    const { category: categorySlug, lang } = await params;
    const category = await prisma.category.findFirst({
        where: { slug: categorySlug, type: 'script' }
    });

    if (!category) return { title: 'Category Not Found' };

    return {
        title: category.metaTitle || `${category.name} Scripts | AI & Dev Library | Promptda`,
        description: category.metaDescription || `Explore our collection of ${category.name} scripts. Professional grade automation and AI integration tools.`,
        alternates: {
            canonical: category.canonicalUrl || `https://promptda.com/${lang}/scripts/${categorySlug}`
        },
        robots: {
            index: !category.noIndex,
            follow: !category.noIndex
        }
    };
}

export default async function CategoryScriptsPage({
    params
}: {
    params: Promise<{ lang: string; category: string }>;
}) {
    const { lang, category: categorySlug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    const category = await prisma.category.findFirst({
        where: { slug: categorySlug, type: 'script' }
    });

    if (!category) {
        notFound();
    }

    const scripts = await getScriptsByCategory(categorySlug);
    const topBlocks = await getCategoryBlocks(categorySlug, 'top');
    const bottomBlocks = await getCategoryBlocks(categorySlug, 'bottom');

    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Scripts", item: `https://promptda.com/${lang}/scripts` },
        { name: category.name, item: `https://promptda.com/${lang}/scripts/${categorySlug}` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
                                {category.name} Scripts
                            </div>

                            {/* Breadcrumb Visual */}
                            <nav className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-12 right-12 hidden md:block">
                                <Link href={`/${lang}`} className="hover:text-blue-500 transition-colors">Home</Link>
                                <span className="mx-2">/</span>
                                <Link href={`/${lang}/scripts`} className="hover:text-blue-500 transition-colors">Scripts</Link>
                                <span className="mx-2">/</span>
                                <span className="text-foreground">{category.name}</span>
                            </nav>

                            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                                {category.headline || (
                                    <>
                                        {category.name} <span className="text-blue-500 italic">Library</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                {category.description || `Professional grade ${category.name} scripts and automation workflows for modern developers.`}
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
                                    placeholder={`Search in ${category.name}...`}
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
                                Sort By
                            </button>
                        </div>
                    </div>

                    {/* Scripts Grid */}
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
                                    <h3 className="text-xl font-bold">No scripts in this category yet</h3>
                                    <p className="text-muted-foreground">Check back later or explore other categories.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEO Info Box */}
                    {category.seoContent && (
                        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-900">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-blue-500" />
                                More About {category.name}
                            </h2>
                            <div
                                className="prose prose-invert max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: category.seoContent }}
                            />
                        </section>
                    )}

                    <BlockRenderer blocks={bottomBlocks} />
                </main>
            </div>
        </div>
    );
}
