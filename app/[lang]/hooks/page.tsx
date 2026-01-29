import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getHooks } from "@/lib/db";
import { HookCard } from "@/components/ui/HookCard";
import { Share2, Zap, Search, Filter, Anchor } from "lucide-react";
import { getContentWithTranslation } from "@/lib/translations";
import { Metadata } from "next";
import Link from "next/link";

import { getSitemapAlternates } from "@/lib/sitemap-utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/hooks';

    return {
        title: dict.Hooks.metaTitle,
        description: dict.Hooks.metaDescription,
        alternates: {
            canonical: `${baseUrl}/${lang}${path}`,
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function HooksPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ category?: string; sort?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const hooksData = await getHooks();
    const hooks = await Promise.all(
        hooksData.map(hook => getContentWithTranslation(hook, 'hook', hook.id, lang as any))
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-12 max-w-[1920px] mx-auto pb-24">
                    {/* Premium Header Section */}
                    <section className="relative p-12 overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-500/10 via-background to-background border border-emerald-500/10">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
                                <Anchor className="w-3.5 h-3.5" />
                                Elite Response Hooks
                            </div>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                                AI Response <span className="text-emerald-500 italic">Hooks</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                Tested and proven hooks to ground your AI responses. Ensure consistency, factual accuracy, and professional tone in every interaction.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    </section>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search hooks..."
                                    className="bg-card border border-border rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64 md:w-80"
                                />
                            </div>
                            <div className="h-10 w-px bg-border/50 hidden md:block" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{hooks.length}</span> Hooks Available
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl text-sm font-bold hover:border-emerald-500 transition-all">
                                <Filter className="w-4 h-4" />
                                All Categories
                            </button>
                        </div>
                    </div>

                    {/* Hooks Grid - Fully Dynamic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {hooks.map((hook: any) => (
                            <HookCard key={hook.id} hook={hook} lang={lang} />
                        ))}

                        {hooks.length === 0 && (
                            <div className="col-span-full py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                    <Anchor className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">No Hooks Found</h3>
                                    <p className="text-muted-foreground">The response library is currently empty. Be the first to add one!</p>
                                </div>
                                <Link href={`/${lang}/upload`} className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
                                    Create a Hook
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

