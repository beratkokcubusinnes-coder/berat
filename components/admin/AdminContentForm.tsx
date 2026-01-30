"use client";

import { useActionState, useEffect, useState } from "react";
import { createAdminContent, updateAdminContent, ContentState } from "@/actions/admin-content";
import { useRouter } from "next/navigation";
import BlockEditor from "./BlockEditor";
import { MultiLanguageEditor } from "./MultiLanguageEditor";
import { cn, slugify } from "@/lib/utils";
import {
    FileCode2,
    Anchor,
    BookOpen,
    Type,
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
    Image as ImageIcon
} from "lucide-react";

interface AdminContentFormProps {
    type: 'script' | 'hook' | 'blog' | 'tool';
    lang: string;
    dict: any;
    categories: any[];
    initialData?: any;
    initialTranslations?: Record<string, any>;
}

export function AdminContentForm({ type, lang, dict, categories, initialData, initialTranslations }: AdminContentFormProps) {
    const isEdit = !!initialData;
    const actionWithId = isEdit ? updateAdminContent.bind(null, initialData.id) : createAdminContent;

    const initialState: ContentState = { message: "", errors: {} };
    const [state, action, isPending] = useActionState(actionWithId, initialState);

    const isBlog = type === 'blog';
    const [description, setDescription] = useState(isBlog ? (initialData?.content || "") : (initialData?.description || ""));
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [isSlugEdited, setIsSlugEdited] = useState(!!initialData?.slug);

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
            router.push(`/${lang}/admin/${type === 'blog' ? 'blog' : type + 's'}`);
        }
    }, [state.success, lang, router, type]);

    // Auto-sync slug and meta
    useEffect(() => {
        if (title && !isSlugEdited) setSlug(slugify(title));
        if (title && !metaTitle) setMetaTitle(title);
        if (title && !ogTitle) setOgTitle(title);
        if (image && !ogImage) setOgImage(image);
    }, [title, image, isSlugEdited]);


    return (
        <form action={action} className="min-h-screen bg-background flex flex-col">
            <input type="hidden" name="type" value={type} />
            {isBlog ? (
                <input type="hidden" name="content" value={description} />
            ) : (
                <input type="hidden" name="description" value={description} />
            )}
            <input type="hidden" name="translations" value={JSON.stringify(translations)} />

            {/* WordPress Style Top Header */}
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
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background",
                            isBlog ? "text-emerald-500" : type === 'script' ? "text-blue-500" : type === 'hook' ? "text-purple-500" : "text-orange-500"
                        )}>
                            {isBlog ? <BookOpen className="w-4 h-4" /> : type === 'script' ? <FileCode2 className="w-4 h-4" /> : type === 'hook' ? <Anchor className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest hidden sm:block">
                            {isBlog ? "Editor" : `${type} Builder`}
                        </span>
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
                        {isPending ? "Saving..." : isEdit ? `Update ${type}` : `Publish ${type}`}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
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
                                    placeholder="Enter title here..."
                                    className="w-full bg-transparent border-none text-4xl md:text-6xl font-black tracking-tight focus:ring-0 placeholder:text-muted-foreground/20 resize-none min-h-[100px]"
                                    rows={2}
                                />
                                <div className="h-1 w-20 bg-primary opacity-20 rounded-full" />
                            </div>

                            {/* Scripts/Hooks Specific Fields */}
                            {!isBlog && type === 'script' && (
                                <div className="bg-muted/30 p-6 rounded-3xl border border-border flex items-center gap-4">
                                    <div className="p-3 bg-background rounded-2xl border border-border text-blue-500">
                                        <FileCode2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Programming Language</label>
                                        <input
                                            name="language"
                                            placeholder="e.g. JavaScript, Python..."
                                            className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Category Selection */}
                            <div className="bg-muted/30 p-6 rounded-3xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-background rounded-2xl border border-border text-primary">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
                                    <select
                                        name="categoryId"
                                        className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 appearance-none cursor-pointer"
                                        required
                                        onChange={(e) => {
                                            const selected = categories.find(c => c.id === e.target.value);
                                            const categoryInput = document.getElementById('base-category-name') as HTMLInputElement;
                                            if (categoryInput && selected) categoryInput.value = selected.name;
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input type="hidden" name="category" id="base-category-name" value="" />
                                </div>
                            </div>

                            {!isBlog && (
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <PenTool className="w-4 h-4" /> Raw Content (Script/Hook Body)
                                    </label>
                                    <textarea
                                        name="content"
                                        rows={12}
                                        placeholder={`Enter the ${type} code or raw content here...`}
                                        className="w-full bg-slate-900 text-pink-300 rounded-3xl p-8 border border-border shadow-inner focus:ring-4 focus:ring-primary/5 outline-none font-mono text-sm leading-relaxed"
                                    />
                                </div>
                            )}

                            {/* Block Editor Section */}
                            <div className="space-y-6">
                                {isBlog ? (
                                    <BlockEditor
                                        value={description}
                                        onChange={setDescription}
                                        placeholder="Start telling your story with blocks..."
                                    />
                                ) : (
                                    <div className="space-y-6 pt-10 border-t border-border/50">
                                        <div className="flex items-center gap-3">
                                            <Layout className="w-5 h-5 text-primary" />
                                            <h3 className="text-sm font-black uppercase tracking-widest">Visual Guide / Description</h3>
                                        </div>
                                        <input type="hidden" name="description" value={description} />
                                        <BlockEditor
                                            value={description}
                                            onChange={setDescription}
                                            placeholder={`Build a visual guide or breakdown for this ${type}...`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* WordPress Style Right Sidebar */}
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
                            Settings
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
                            Social
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab('translations')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeSidebarTab === 'translations' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Globe
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {activeSidebarTab === 'settings' && (
                            <>
                                {/* Basic Settings */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Settings className="w-3 h-3" /> General Controls
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL Slug</label>
                                            <div className="relative">
                                                <input
                                                    name="slug"
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setSlug(e.target.value);
                                                        setIsSlugEdited(true);
                                                    }}
                                                    onBlur={() => setSlug(slugify(slug))}
                                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Globe className="w-3 h-3 text-muted-foreground/30" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Published Date</label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    name="createdAt"
                                                    defaultValue={new Date().toISOString().slice(0, 16)}
                                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all shrink-0"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                                Last Updated (Manual)
                                                <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">Ranking Booster</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="lastUpdated"
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all shrink-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Image Section */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <ImageIcon className="w-3 h-3" /> Featured Image (Grid/Thumbnail)
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-muted/30 rounded-[2rem] border border-border overflow-hidden relative group">
                                            {image ? (
                                                <img src={image} className="w-full h-full object-cover" alt="Featured" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 gap-2">
                                                    <Layout className="w-8 h-8" />
                                                    <span className="text-[8px] font-black uppercase italic">No Image Selected</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4">
                                                <p className="text-[10px] text-white font-bold text-center uppercase tracking-widest leading-relaxed">
                                                    Paste URL below or use Media Library
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                name="image"
                                                value={image}
                                                onChange={(e) => setImage(e.target.value)}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-[10px] font-medium focus:ring-2 focus:ring-primary/20 transition-all italic"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Settings className="w-3 h-3 text-muted-foreground/20" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <p className="text-[8px] text-emerald-500/80 leading-relaxed font-bold uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3" /> Used in all grid cards and thumbnails.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Prompt Metadata */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Brain className="w-3 h-3" /> Prompt Metadata
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt Count</label>
                                            <input
                                                type="number"
                                                name="promptCount"
                                                value={promptCount}
                                                onChange={(e) => setPromptCount(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                                            <select
                                                name="promptType"
                                                value={promptType}
                                                onChange={(e) => setPromptType(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                            >
                                                <option>ChatGPT</option>
                                                <option>Midjourney</option>
                                                <option>Claude</option>
                                                <option>DALL-E</option>
                                                <option>Stable Diffusion</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* E-E-A-T Author Overrides */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <UserCircle className="w-3 h-3" /> E-E-A-T (Author Override)
                                    </h4>
                                    <div className="space-y-3">
                                        <input
                                            name="authorName"
                                            placeholder="Display Name Override"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <textarea
                                            name="authorBio"
                                            placeholder="Author bio preview (1-2 sentences)"
                                            rows={2}
                                            value={authorBio}
                                            onChange={(e) => setAuthorBio(e.target.value)}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSidebarTab === 'seo' && (
                            <div className="space-y-8">
                                {/* Snippet Preview */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Eye className="w-3 h-3" /> SERP Preview (Desktop)
                                    </h4>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                                        <div className="text-[12px] text-[#202124] dark:text-slate-400 flex items-center gap-1 mb-1 truncate">
                                            promptda.com › {lang} › {slug || "..."}
                                        </div>
                                        <div className="text-[20px] text-[#1a0dab] dark:text-blue-400 hover:underline cursor-pointer leading-tight mb-1 truncate">
                                            {metaTitle || "Meta Title Preview..."}
                                        </div>
                                        <div className="text-[14px] text-[#4d5156] dark:text-slate-400 leading-snug line-clamp-2">
                                            {metaDescription || "Please provide a meta description to see how it looks in search results."}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Controls */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Search className="w-3 h-3" /> Search Meta
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Title</label>
                                                <span className={cn("text-[8px] font-mono", metaTitle.length > 60 ? "text-red-500" : "text-emerald-500")}>{metaTitle.length}/60</span>
                                            </div>
                                            <input
                                                name="metaTitle"
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Description</label>
                                                <span className={cn("text-[8px] font-mono", metaDescription.length > 160 ? "text-red-500" : "text-emerald-500")}>{metaDescription.length}/160</span>
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

                                {/* TL;DR / Summary Optimization */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <CheckCircle2 className="w-3 h-3" /> Fragment / Snippet Optimization
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                            TL;DR / AI Overview Text
                                            <span className="text-[8px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full uppercase">Google Snippet</span>
                                        </label>
                                        <textarea
                                            name="tldr"
                                            value={tldr}
                                            onChange={(e) => setTldr(e.target.value)}
                                            placeholder="Sum up the content in 40-60 words..."
                                            rows={4}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none italic"
                                        />
                                        <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                            <Info className="w-3 h-3 text-blue-500 shrink-0" />
                                            <p className="text-[8px] text-blue-500/80 leading-relaxed font-bold uppercase tracking-widest">
                                                Used for Featured Snippets & AI Overviews. Keep it concise.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Crawl Controls */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <ShieldAlert className="w-3 h-3" /> Indexing & Crawl
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="group relative flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all">
                                            <input type="checkbox" name="noIndex" className="w-4 h-4 rounded-md border-border text-primary focus:ring-primary/20 transition-all" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Noindex</span>
                                        </label>
                                        <label className="group relative flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all">
                                            <input type="checkbox" name="noFollow" className="w-4 h-4 rounded-md border-border text-primary focus:ring-primary/20 transition-all" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Nofollow</span>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Canonical URL</label>
                                        <input
                                            name="canonicalUrl"
                                            placeholder="https://..."
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSidebarTab === 'social' && (
                            <div className="space-y-8">
                                {/* Social Card Preview */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Share2 className="w-3 h-3" /> Social Preview (Card)
                                    </h4>
                                    <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-border shadow-sm">
                                        <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                                            {ogImage ? (
                                                <img src={ogImage} className="w-full h-full object-cover" alt="OG Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                                                    <Layout className="w-12 h-12" />
                                                    <span className="text-[10px] font-bold uppercase">Image Preview</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">PROMPTDA.COM</div>
                                            <div className="text-sm font-black line-clamp-2">{ogTitle || "Open Graph Title Preview..."}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ogDescription || "OG description summary for social sharing previews..."}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Controls */}
                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                        <Settings className="w-3 h-3" /> Meta Override
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OG Image URL</label>
                                            <input
                                                name="ogImage"
                                                value={ogImage}
                                                onChange={(e) => setOgImage(e.target.value)}
                                                placeholder="https://example.com/social-cover.jpg"
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OG Title</label>
                                            <input
                                                name="ogTitle"
                                                value={ogTitle}
                                                onChange={(e) => setOgTitle(e.target.value)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OG Description</label>
                                            <textarea
                                                name="ogDescription"
                                                value={ogDescription}
                                                onChange={(e) => setOgDescription(e.target.value)}
                                                rows={3}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeSidebarTab === 'translations' && (
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground/50">
                                    <Globe className="w-3 h-3" /> Multi-Language Content
                                </h4>
                                <div className="p-2 -mx-2 bg-muted/20 border border-border rounded-2xl">
                                    <MultiLanguageEditor
                                        hideDefaultLanguage={true}
                                        fields={isBlog ? [
                                            { label: 'Title', name: 'title', type: 'text', required: true },
                                            { label: 'Excerpt / Summary', name: 'description', type: 'textarea', rows: 3 },
                                            { label: 'Blog Content', name: 'content', type: 'richtext', rows: 12 },
                                            { label: 'Meta Title', name: 'metaTitle', type: 'text' },
                                            { label: 'Meta Description', name: 'metaDescription', type: 'textarea', rows: 2 },
                                        ] : [
                                            { label: 'Title', name: 'title', type: 'text', required: true },
                                            { label: 'Content (Actual Script/Hook)', name: 'content', type: 'textarea', rows: 6 },
                                            { label: 'Description / Guide', name: 'description', type: 'richtext', rows: 12 },
                                            { label: 'Meta Title', name: 'metaTitle', type: 'text' },
                                            { label: 'Meta Description', name: 'metaDescription', type: 'textarea', rows: 2 },
                                        ]}
                                        values={translations}
                                        onChange={(lang, field, value) => {
                                            setTranslations(prev => ({
                                                ...prev,
                                                [lang]: {
                                                    ...prev[lang],
                                                    [field]: value,
                                                },
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 space-y-3 mt-auto">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Assistant</h5>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-70">
                                Optimized content with a {tldr ? "Snippet" : "No Snippet"} and meta tags usually ranks 40% higher on SERPs.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {state.errors?.title && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] p-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-10">
                    Error: {state.errors.title[0]}
                </div>
            )}
        </form>
    );
}
