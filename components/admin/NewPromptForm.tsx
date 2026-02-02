"use client";

import { useActionState, useEffect, useState } from "react";
import { createPrompt, updatePrompt, PromptState } from "@/actions/prompts";
import { useRouter } from "next/navigation";
import BlockEditor from "./BlockEditor";
import { MultiLanguageEditor } from "./MultiLanguageEditor";
import { ImageUpload } from "./ImageUpload";
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

interface NewPromptFormProps {
    lang: string;
    dict: any;
    categories: any[];
    initialData?: any;
    initialTranslations?: Record<string, any>;
}

export function NewPromptForm({ lang, dict, categories, initialData, initialTranslations }: NewPromptFormProps) {
    const isEdit = !!initialData;
    const actionWithId = isEdit ? updatePrompt.bind(null, initialData.id) : createPrompt;

    const initialState: PromptState = { message: "", errors: {} };
    const [state, action, isPending] = useActionState(actionWithId, initialState);

    const [description, setDescription] = useState(initialData?.description || "");
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [isSlugEdited, setIsSlugEdited] = useState(!!initialData?.slug);
    const [model, setModel] = useState(initialData?.model || "");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [categoryName, setCategoryName] = useState(initialData?.category || "");

    // SEO States
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
    const [image, setImage] = useState(initialData?.image || "");
    const [ogTitle, setOgTitle] = useState(initialData?.ogTitle || "");
    const [ogDescription, setOgDescription] = useState(initialData?.ogDescription || "");
    const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
    const [tldr, setTldr] = useState(initialData?.tldr || "");
    const [authorName, setAuthorName] = useState(initialData?.authorName || "");
    const [authorBio, setAuthorBio] = useState(initialData?.authorBio || "");
    const [promptCount, setPromptCount] = useState(initialData?.promptCount?.toString() || "1");
    const [promptType, setPromptType] = useState(initialData?.promptType || "ChatGPT");
    const [content, setContent] = useState(initialData?.content || "");

    // Translation State
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(initialTranslations || {
        en: {},
        tr: {},
        de: {},
        es: {},
    });

    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeSidebarTab, setActiveSidebarTab] = useState<'settings' | 'seo' | 'social' | 'translations'>('settings');

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(`/${lang}/admin/prompts`);
        }
    }, [state.success, lang, router]);

    // Auto-sync
    useEffect(() => {
        if (title && !isSlugEdited) setSlug(slugify(title));
        if (title && !metaTitle) setMetaTitle(title);
        if (title && !ogTitle) setOgTitle(title);
        if (image && !ogImage) setOgImage(image);
    }, [title, image, isSlugEdited]);

    return (
        <form action={action} className="min-h-screen bg-background flex flex-col -m-4 sm:-m-8">
            <input type="hidden" name="description" value={description} />
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="translations" value={JSON.stringify(translations)} />

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
                        <span className="text-sm font-black uppercase tracking-widest hidden sm:block">Prompt Studio</span>
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

                    {((state.message && !state.success) || (state.errors && Object.keys(state.errors).length > 0)) && (
                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 mr-2 max-w-[300px] truncate" title={state.message || JSON.stringify(state.errors)}>
                            {!state.success && state.message ? state.message : `Check fields: ${Object.keys(state.errors || {}).join(", ")}`}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "px-6 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2",
                            isPending && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isPending ? "Saving..." : isEdit ? "Update Prompt" : "Publish Prompt"}
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
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
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
                                        value={categoryId}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value);
                                            const selected = categories.find(c => c.id === e.target.value);
                                            if (selected) setCategoryName(selected.name);
                                        }}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input type="hidden" name="category" value={categoryName} />
                                </div>
                            </div>

                            {/* The Actual Prompt Box */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Send className="w-3 h-3" /> The Raw Prompt
                                </label>
                                <textarea
                                    name="content"
                                    rows={6}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter the actual prompt text here..."
                                    className="w-full bg-slate-900 text-emerald-400 rounded-3xl p-8 border border-border shadow-inner focus:ring-4 focus:ring-primary/5 outline-none font-mono text-sm leading-relaxed"
                                />
                                {state.errors?.content && <p className="text-xs text-red-500 font-bold uppercase tracking-widest">{state.errors.content[0]}</p>}
                            </div>

                            {/* Extra Reference Image / Gallery */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Image Gallery (Comma Separated)
                                </label>
                                <textarea
                                    name="images"
                                    defaultValue={initialData?.images || ""}
                                    placeholder="https://... , https://..."
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all font-mono resize-none"
                                    rows={2}
                                />
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
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab('translations')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeSidebarTab === 'translations' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Globe className="w-3 h-3 mx-auto" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <div className={cn("space-y-6", activeSidebarTab !== 'settings' && "hidden")}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                <Settings className="w-3 h-3" /> Core Config
                            </h4>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt URL Slug</label>
                                    <input
                                        name="slug"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlug(e.target.value);
                                            setIsSlugEdited(true);
                                        }}
                                        onBlur={() => setSlug(slugify(slug))}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Publication Date</label>
                                    <input
                                        type="datetime-local"
                                        name="createdAt"
                                        defaultValue={new Date().toISOString().slice(0, 16)}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all opacity-50 cursor-not-allowed"
                                        disabled
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
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Featured Image Section */}
                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <ImageIcon className="w-3 h-3" /> Primary Featured Image
                                </h4>
                                <div className="space-y-4">
                                    <ImageUpload
                                        name="image"
                                        label="Primary Featured Image"
                                        defaultValue={image}
                                        onPreviewChange={(url) => setImage(url)}
                                    />
                                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                        <p className="text-[8px] text-emerald-500/80 leading-relaxed font-bold uppercase tracking-widest">
                                            This image represents your prompt in all grids.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <Brain className="w-3 h-3" /> Variations & Stats
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" /> Featured Prompt
                                            </label>
                                            <p className="text-[9px] text-muted-foreground font-medium">Display in the homepage trending grid.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isFeatured" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt Count</label>
                                            <input
                                                type="number"
                                                name="promptCount"
                                                value={promptCount}
                                                onChange={(e) => setPromptCount(e.target.value)}
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
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <UserCircle className="w-3 h-3" /> E-E-A-T Identity
                                </h4>
                                <div className="space-y-3">
                                    <input
                                        name="authorName"
                                        placeholder="Guest Author Name (Optional)"
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <textarea
                                        name="authorBio"
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
                                    <ImageUpload
                                        name="beforeImage"
                                        label="Before Image"
                                        defaultValue={initialData?.beforeImage}
                                    />
                                    <ImageUpload
                                        name="afterImage"
                                        label="After Image"
                                        defaultValue={initialData?.afterImage}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <Eye className="w-3 h-3" /> Manual engagement stats
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Views</label>
                                        <input
                                            type="number"
                                            name="views"
                                            defaultValue={initialData?.views || 0}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Likes</label>
                                        <input
                                            type="number"
                                            name="likes"
                                            defaultValue={initialData?.likes || 0}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("space-y-8", activeSidebarTab !== 'seo' && "hidden")}>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <Eye className="w-3 h-3" /> SERP Simulation
                                </h4>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                                    <div className="text-[12px] text-[#202124] dark:text-slate-400 flex items-center gap-1 mb-1">
                                        promptda.com › prompt › {slug || "..."}
                                    </div>
                                    <div className="text-[20px] text-[#1a0dab] dark:text-blue-400 font-medium mb-1 line-clamp-1 italic underline">
                                        {metaTitle || "Creative Prompt Title..."}
                                    </div>
                                    <div className="text-[14px] text-[#4d5156] dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {metaDescription || "Discover the best AI prompts for your projects. Copy, paste, and create."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <Search className="w-3 h-3" /> On-Page SEO
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Meta Title</span>
                                            <span className={cn(metaTitle.length > 60 ? "text-red-500" : "text-primary")}>{metaTitle.length}/60</span>
                                        </div>
                                        <input
                                            name="metaTitle"
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Meta Description</span>
                                            <span className={cn(metaDescription.length > 160 ? "text-red-500" : "text-primary")}>{metaDescription.length}/160</span>
                                        </div>
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
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Snippet Highlight</h4>
                                    <span className="text-[8px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold uppercase">Boost</span>
                                </div>
                                <textarea
                                    name="tldr"
                                    value={tldr}
                                    onChange={(e) => setTldr(e.target.value)}
                                    placeholder="Briefly summarize this prompt in 40-60 words for Google Snippets..."
                                    rows={4}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none italic"
                                />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> Indexing
                                </h4>
                                <div className="flex gap-4">
                                    <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/10 cursor-pointer hover:bg-muted/30">
                                        <input type="checkbox" name="noIndex" className="rounded-md" />
                                        <span className="text-[10px] font-black uppercase">Noindex</span>
                                    </label>
                                    <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/10 cursor-pointer hover:bg-muted/30">
                                        <input type="checkbox" name="noFollow" className="rounded-md" />
                                        <span className="text-[10px] font-black uppercase">Nofollow</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={cn("space-y-8", activeSidebarTab !== 'social' && "hidden")}>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                    <Share2 className="w-3 h-3" /> Social Graph Preview
                                </h4>
                                <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-border shadow-xl">
                                    <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                                        {ogImage ? <img src={ogImage} className="w-full h-full object-cover" alt="OG Preview" /> : <Sparkles className="w-12 h-12 text-slate-700" />}
                                    </div>
                                    <div className="p-6">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">PROMPTDA | PROMPT</div>
                                        <div className="text-white text-md font-bold mb-1">{ogTitle || "Shareable Title..."}</div>
                                        <div className="text-slate-400 text-xs line-clamp-2">{ogDescription || metaDescription || "OG description here..."}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
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

                        <div className={cn("space-y-6", activeSidebarTab !== 'translations' && "hidden")}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                <Globe className="w-3 h-3" /> Multi-Language Content
                            </h4>
                            <div className="p-2 -mx-2 bg-muted/20 border border-border rounded-2xl">
                                <MultiLanguageEditor
                                    hideDefaultLanguage={true}
                                    fields={[
                                        { label: 'Title', name: 'title', type: 'text', required: true },
                                        { label: 'The actual Prompt Command', name: 'content', type: 'textarea', rows: 4 },
                                        { label: 'Technical Guide (Blocks)', name: 'description', type: 'richtext', rows: 12 },
                                        { label: 'Meta Title', name: 'metaTitle', type: 'text' },
                                        { label: 'Meta Description', name: 'metaDescription', type: 'textarea', rows: 2 },
                                    ]}
                                    values={translations}
                                    sourceValues={{
                                        title,
                                        content,
                                        description,
                                        metaTitle,
                                        metaDescription
                                    }}
                                    onChange={(lang, field, value) => {
                                        setTranslations(prev => ({
                                            ...prev,
                                            [lang]: {
                                                ...prev[lang],
                                                [field]: value,
                                            },
                                        }));
                                    }}
                                    sourceLanguageCode={lang}
                                />
                            </div>
                        </div>
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
