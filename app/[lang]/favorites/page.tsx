import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PromptCard } from "@/components/ui/PromptCard";
import { ScriptCard } from "@/components/ui/ScriptCard";
import { HookCard } from "@/components/ui/HookCard";
import { ToolCard } from "@/components/ui/ToolCard";
import { CommunityCard } from "@/components/ui/CommunityCard";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getUserFavorites } from "@/lib/db";
import { Heart, Search, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FavoritesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    if (!session) {
        redirect(`/${lang}/login`);
    }

    const favorites = await getUserFavorites(session.id as string);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-12 max-w-[1920px] mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/10 text-[10px] font-black uppercase tracking-widest">
                                <Heart className="w-3 h-3 fill-current" />
                                Your Personal Collection
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter">My Favorites</h1>
                            <p className="text-muted-foreground text-lg max-w-xl">
                                All your saved prompts, scripts, and tools in one premium organized space.
                            </p>
                        </div>
                    </div>

                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                            {favorites.map((item: any) => {
                                switch (item.itemType) {
                                    case 'prompt':
                                        return <PromptCard key={item.id} prompt={item} lang={lang} />;
                                    case 'script':
                                        return <ScriptCard key={item.id} script={item} lang={lang} />;
                                    case 'hook':
                                        return <HookCard key={item.id} hook={item} lang={lang} />;
                                    case 'tool':
                                        return <ToolCard key={item.id} tool={item} lang={lang} />;
                                    case 'thread':
                                        return <CommunityCard key={item.id} thread={item} lang={lang} />;
                                    default:
                                        return null;
                                }
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/10 shadow-2xl relative z-10">
                                    <Heart className="w-12 h-12 text-primary/40 stroke-[1.5]" />
                                </div>
                                <div className="absolute inset-0 bg-primary/10 blur-3xl -z-0 opacity-50" />
                            </div>

                            <div className="space-y-3 max-w-md mx-auto">
                                <h2 className="text-3xl font-black tracking-tight text-foreground">Your collection is empty</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    You haven't saved any items yet. Explore our library to find high-quality prompts and tools to add to your collection.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={`/${lang}`} className="flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/10 group">
                                    <Search className="w-4 h-4" />
                                    Explore Library
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href={`/${lang}/prompts`} className="flex items-center gap-3 bg-card border border-border px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary transition-all">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Featured Prompts
                                </Link>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
