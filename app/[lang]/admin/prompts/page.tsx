import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import { PromptsList } from "@/components/admin/PromptsList";

export default async function AdminPromptsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const prompts = await prisma.prompt.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Prompts</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review, edit, and organize all community prompts.</p>
                </div>
                <Link
                    href={`/${lang}/admin/prompts/new`}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <Plus className="w-4 h-4" />
                    Add New Prompt
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        placeholder="Search prompts by title or author..."
                        className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex-1 md:flex-none">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        Sort: Newest
                    </button>
                    <button className="px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex-1 md:flex-none">
                        Category: All
                    </button>
                </div>
            </div>

            <PromptsList prompts={prompts} lang={lang} />

            {prompts.length === 0 && (
                <div className="bg-card border border-border rounded-3xl p-20 text-center shadow-sm">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No prompts found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Start building your community by adding the first prompt.</p>
                    <Link
                        href={`/${lang}/admin/prompts/new`}
                        className="inline-flex items-center gap-2 text-primary text-sm font-bold mt-6 hover:underline"
                    >
                        Add New Prompt
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
