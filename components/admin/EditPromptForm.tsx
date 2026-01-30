"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePrompt, PromptState } from "@/actions/prompts";
import { useRouter } from "next/navigation";
import BlockEditor from "./BlockEditor";
import { cn, slugify } from "@/lib/utils";
import {
    Sparkles,
    Image as ImageIcon,
    Type,
    Send,
    Layout,
    ChevronLeft,
    Monitor,
    Smartphone,
    Settings,
    Globe,
    Calendar,
    PenTool,
    Search,
    Share2,
    ShieldAlert,
    Brain,
    UserCircle,
    Eye,
    CheckCircle2,
    Info,
    Box
} from "lucide-react";

export default function EditPromptForm({ prompt, lang, dict, categories }: { prompt: any, lang: string, dict: any, categories: any[] }) {
    const updatePromptWithId = updatePrompt.bind(null, prompt.id);
    const initialState: PromptState = { message: "", errors: {} };
    const [state, action, isPending] = useActionState(updatePromptWithId, initialState);

    const [description, setDescription] = useState(prompt.description || "");
    const [title, setTitle] = useState(prompt.title || "");
    const [slug, setSlug] = useState(prompt.slug || "");
    const [promptCount, setPromptCount] = useState(prompt.promptCount || 1);
    const [promptType, setPromptType] = useState(prompt.promptType || "ChatGPT");

    // SEO States
    const [metaTitle, setMetaTitle] = useState(prompt.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(prompt.metaDescription || "");
    const [image, setImage] = useState(prompt.image || "");
    const [ogTitle, setOgTitle] = useState(prompt.ogTitle || "");
    const [ogDescription, setOgDescription] = useState(prompt.ogDescription || "");
    const [ogImage, setOgImage] = useState(prompt.ogImage || "");
    const [tldr, setTldr] = useState(prompt.tldr || "");

    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeSidebarTab, setActiveSidebarTab] = useState<'settings' | 'seo' | 'social'>('settings');

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(`/${lang}/admin/prompts`);
            router.refresh();
        }
    }, [state.success, lang, router]);

    return (
        <form action={action} className="min-h-screen bg-background flex flex-col -m-4 sm:-m-8">
            <input type="hidden" name="description" value={description} />
            <input type="hidden" name="lang" value={lang} />

            {/* Immersive Header */}
            <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest hidden sm:block">Edit Prompt</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-muted/50 rounded-xl p-1 border border-border">
                        <button
                            type="button"
                            onClick={() => setPreviewMode('desktop')}
                            className={cn("p-1.5 rounded-lg transition-all", previewMode === 'desktop' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewMode('mobile')}
                            className={cn("p-1.5 rounded-lg transition-all", previewMode === 'mobile' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "px-6 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2",
                            isPending && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isPending ? "Saving..." : "Update Prompt"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Canvas */}
                <main className="flex-1 overflow-y-auto bg-muted/5 p-4 sm:p-10 lg:p-20 flex justify-center">
                    <div className={cn(
                        "transition-all duration-500 bg-background shadow-2xl border border-border h-fit",
                        previewMode === 'desktop' ? "w-full max-w-4xl min-h-screen rounded-[2.5rem] p-12 sm:p-20" : "w-[375px] min-h-[667px] rounded-[3.5rem] p-8 mt-10 md:mt-0 border-[12px] border-slate-900"
                    )}>
                        <div className="max-w-3xl mx-auto space-y-12">
                            {/* Title area */}
                            <div className="space-y-4">
                                <textarea
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter prompt title..."
                                    className="w-full bg-transparent border-none text-4xl md:text-6xl font-black tracking-tight focus:ring-0 placeholder:text-muted-foreground/20 resize-none min-h-[100px]"
                                    rows={2}
                                />
                                <div className="h-1 w-20 bg-primary opacity-20 rounded-full" />
                            </div>

                            {/* Prompt Model & Category Selection Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-8 rounded-[2rem] border border-border">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Box className="w-3 h-3" /> AI Model
                                    </label>
                                    <select
                                        name="model"
                                        defaultValue={prompt.model}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                    >
                                        <option value="Midjourney">Midjourney</option>
                                        <option value="DALL-E 3">DALL-E 3</option>
                                        <option value="Stable Diffusion">Stable Diffusion</option>
                                        <option value="GPT-4">GPT-4</option>
                                        <option value="Gemini">Gemini</option>
                                        <option value="Claude 3">Claude 3</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Layout className="w-3 h-3" /> Category
                                    </label>
                                    <select
                                        name="categoryId"
                                        defaultValue={prompt.categoryId || ""}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        onChange={(e) => {
                                            const selected = categories.find(c => c.id === e.target.value);
                                            const categoryInput = document.querySelector('input[name="category"]') as HTMLInputElement;
                                            if (categoryInput && selected) categoryInput.value = selected.name;
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input type="hidden" name="category" defaultValue={prompt.category || ""} />
                                </div>
                            </div>

                            {/* The Actual Prompt Box */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Send className="w-3 h-3" /> The Raw Prompt
                                </label>
                                <textarea
                                    name="content"
                                    defaultValue={prompt.content}
                                    rows={6}
                                    placeholder="Enter the actual prompt text here..."
                                    className="w-full bg-slate-900 text-emerald-400 rounded-3xl p-8 border border-border shadow-inner focus:ring-4 focus:ring-primary/5 outline-none font-mono text-sm leading-relaxed"
                                />
                                {state.errors?.content && <p className="text-xs text-red-500 font-bold uppercase tracking-widest">{state.errors.content[0]}</p>}
                            </div>

                            {/* Visual Block Editor for Description */}
                            <div className="space-y-6 pt-10 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <PenTool className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Guide & Breakdown (Blocks)</h3>
                                </div>
                                <BlockEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Add visual guides, breakdowns, or tips using blocks..."
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* SEO Sidebar */}
                <aside className="w-96 border-l border-border bg-card hidden xl:flex flex-col overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab('settings')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeSidebarTab === 'settings' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Post
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab('seo')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeSidebarTab === 'seo' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            SEO
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab('social')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeSidebarTab === 'social' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Share
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {activeSidebarTab === 'settings' && (
                            <>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Settings className="w-3 h-3" /> Core Config
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt URL Slug</label>
                                            <input
                                                name="slug"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                onBlur={() => setSlug(slugify(slug))}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                                Manual freshness
                                                <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">Update Booster</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="lastUpdated"
                                                defaultValue={prompt.lastUpdated ? new Date(prompt.lastUpdated).toISOString().slice(0, 16) : ""}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Variations & Stats */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Brain className="w-3 h-3" /> Variations & Stats
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt Count</label>
                                            <input
                                                type="number"
                                                name="promptCount"
                                                value={promptCount}
                                                onChange={(e) => setPromptCount(parseInt(e.target.value) || 0)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type Label</label>
                                            <select
                                                name="promptType"
                                                value={promptType}
                                                onChange={(e) => setPromptType(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-bold"
                                            >
                                                <option>ChatGPT</option>
                                                <option>Midjourney</option>
                                                <option>Text-to-Image</option>
                                                <option>Creative</option>
                                                <option>Business</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Image Section */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <ImageIcon className="w-3 h-3" /> Primary Featured Image
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-muted/30 rounded-[2rem] border border-border overflow-hidden relative group">
                                            {image ? (
                                                <img src={image} className="w-full h-full object-cover" alt="Featured" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 gap-2">
                                                    <Layout className="w-8 h-8" />
                                                    <span className="text-[8px] font-black uppercase italic">Not Set</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            name="image"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            placeholder="Paste primary image URL..."
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-[10px] font-medium focus:ring-2 focus:ring-primary/20 transition-all italic"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <UserCircle className="w-3 h-3" /> Identity (Manual Override)
                                    </h4>
                                    <div className="space-y-3">
                                        <input
                                            name="authorName"
                                            defaultValue={prompt.authorName || ""}
                                            placeholder="Guest Author Name (Optional)"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <textarea
                                            name="authorBio"
                                            defaultValue={prompt.authorBio || ""}
                                            placeholder="Short credentials for this post..."
                                            rows={2}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <ImageIcon className="w-3 h-3" /> Before & After Images
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Before Image URL</label>
                                            <input
                                                name="beforeImage"
                                                defaultValue={prompt.beforeImage || ""}
                                                placeholder="https://..."
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-[10px] font-medium focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">After Image URL</label>
                                            <input
                                                name="afterImage"
                                                defaultValue={prompt.afterImage || ""}
                                                placeholder="https://..."
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-[10px] font-medium focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Eye className="w-3 h-3" /> Manual engagement stats
                                    </h4>

                                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" /> Featured Prompt
                                            </label>
                                            <p className="text-[9px] text-muted-foreground font-medium">Display in the homepage trending grid.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                defaultChecked={prompt.isFeatured}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Views</label>
                                            <input
                                                type="number"
                                                name="views"
                                                defaultValue={prompt.views}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Likes</label>
                                            <input
                                                type="number"
                                                name="likes"
                                                defaultValue={prompt.likes}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSidebarTab === 'seo' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Search className="w-3 h-3" /> On-Page SEO
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Title</label>
                                            <input
                                                name="metaTitle"
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Description</label>
                                            <textarea
                                                name="metaDescription"
                                                value={metaDescription}
                                                onChange={(e) => setMetaDescription(e.target.value)}
                                                rows={3}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Snippet Highlight</h4>
                                    <textarea
                                        name="tldr"
                                        value={tldr}
                                        onChange={(e) => setTldr(e.target.value)}
                                        placeholder="Briefly summarize this prompt in 40-60 words..."
                                        rows={4}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none italic"
                                    />
                                </div>
                            </div>
                        )}

                        {activeSidebarTab === 'social' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                        <Share2 className="w-3 h-3" /> Social Graph
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OG Image</label>
                                            <input
                                                name="ogImage"
                                                value={ogImage}
                                                onChange={(e) => setOgImage(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OG Title</label>
                                            <input
                                                name="ogTitle"
                                                value={ogTitle}
                                                onChange={(e) => setOgTitle(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {state.message && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-red-500 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl animate-in zoom-in-95">
                    {state.message}
                </div>
            )}
        </form>
    );
}
