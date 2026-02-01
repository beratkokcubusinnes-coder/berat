"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Search, Share2, FileText, Settings, Loader2, AlertCircle, CheckCircle2, RefreshCw, Box, Sliders, Languages, LayoutTemplate, Check, Info, Crop, Calendar, HardDrive, Trash2, Edit3, X, Image as ImageIcon, Zap, Rocket } from "lucide-react";
import { MediaLibrary } from "../settings/MediaLibrary";
import { AnimatePresence } from "framer-motion";

export function SeoSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
    const [activeTab, setActiveTab] = useState("global");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState(initialSettings);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Translation Metadata State
    const [selectedLang, setSelectedLang] = useState("en");
    const [metadata, setMetadata] = useState<Record<string, any>>({});
    const [isMetadataLoading, setIsMetadataLoading] = useState(false);
    const [mediaField, setMediaField] = useState<{ section: string | 'settings', field: string } | null>(null);
    const [isTranslating, setIsTranslating] = useState<string | null>(null);

    const handleAutoTranslate = async (section: string) => {
        if (selectedLang === 'en') {
            alert("Already in English. Switch language to translate.");
            return;
        }
        setIsTranslating(section);

        try {
            // 1. Get English values from API
            const enRes = await fetch(`/api/admin/seo/translations?lang=en`);
            const enData = await enRes.json();
            const source = enData[section];

            if (!source) throw new Error("No source found for " + section);

            const fields = Object.keys(source).filter(k =>
                typeof source[k] === 'string' &&
                source[k].length > 0 &&
                !k.toLowerCase().includes('image') &&
                !k.toLowerCase().includes('icon')
            );

            const updatedSection = { ...metadata[section] };

            for (const field of fields) {
                const res = await fetch("/api/admin/seo/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: source[field],
                        targetLang: selectedLang
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    updatedSection[field] = data.translatedText;
                }
            }

            setMetadata(prev => ({ ...prev, [section]: updatedSection }));
            setMessage({ type: 'success', text: `${section} translated successfully!` });
        } catch (error) {
            console.error("Translation failed:", error);
            setMessage({ type: 'error', text: "Translation failed." });
        } finally {
            setIsTranslating(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'metadata' || activeTab === 'content') {
            fetchMetadata(selectedLang);
        }
    }, [activeTab, selectedLang]);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/seo");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMetadata = async (lang: string) => {
        setIsMetadataLoading(true);
        try {
            const res = await fetch(`/api/admin/seo/translations?lang=${lang}`);
            if (res.ok) {
                const data = await res.json();
                setMetadata(data);
            }
        } catch (error) {
            console.error("Failed to fetch metadata", error);
        } finally {
            setIsMetadataLoading(false);
        }
    };

    const handleSaveMetadata = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/admin/seo/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lang: selectedLang, updates: metadata })
            });

            if (!res.ok) throw new Error("Failed to save");

            setMessage({ type: 'success', text: "Metadata translations saved successfully!" });
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            setMessage({ type: 'error', text: "Failed to save translations." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleMetadataChange = (section: string, field: string, value: any) => {
        setMetadata(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async (group: string) => {
        setIsSaving(true);
        setMessage(null);

        // Filter settings relevant to the current group/tab if needed, 
        // or just save the keys that belong to this tab.
        // For simplicity, we can send all, but better to send only relevant ones.
        // Since I'm using a single state object, I'll filter manually based on tab for cleanliness, 
        // OR just send the specific keys I know belong to this tab.

        // Let's create a subset of settings based on activeTab
        let keysToSave: string[] = [];
        if (activeTab === "global") keysToSave = ["site_title", "title_separator", "site_description", "site_keywords", "favicon"];
        if (activeTab === "indexing") keysToSave = ["robots_txt", "meta_robots_default", "noindex_categories", "noindex_tags"];
        if (activeTab === "social") keysToSave = ["og_image", "twitter_handle", "facebook_app_id"];
        if (activeTab === "sitemap") keysToSave = ["sitemap_include_images", "sitemap_include_tags"];
        if (activeTab === "schema") keysToSave = ["schema_org_type", "schema_phone", "schema_same_as"];
        if (activeTab === "indexing_api") keysToSave = ["google_indexing_enabled", "google_service_account_json", "indexnow_enabled", "indexnow_key", "indexnow_host"];
        if (activeTab === "advanced") keysToSave = ["canonical_clean_params", "force_trailing_slash"];
        if (activeTab === "redirects") keysToSave = []; // Handled separately

        const payload: Record<string, any> = {};
        keysToSave.forEach(key => {
            payload[key] = settings[key] || "";
        });

        try {
            const res = await fetch("/api/admin/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: payload, group: activeTab })
            });

            if (!res.ok) throw new Error("Failed to save");

            setMessage({ type: 'success', text: "Settings saved successfully!" });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            setMessage({ type: 'error', text: "Something went wrong. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (action: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/seo/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.message || "Action failed" });
            }
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ type: 'error', text: "Network error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const tabs = [
        { id: "global", label: "Global Settings", icon: Globe },
        { id: "content", label: "Homepage Content", icon: LayoutTemplate },
        { id: "metadata", label: "Page Metadata", icon: Languages },
        { id: "indexing", label: "Indexing & Robots", icon: Search },
        { id: "indexing_api", label: "Indexing API (Google/Bing)", icon: Zap },
        { id: "social", label: "Social Media", icon: Share2 },
        { id: "sitemap", label: "Sitemap", icon: FileText },
        { id: "schema", label: "Structured Data", icon: Box },
        { id: "advanced", label: "Advanced", icon: Sliders },
    ];

    return (
        <div className="space-y-6">
            {/* Header Message */}
            {message && (
                <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border ${message.type === 'success' ? "bg-card border-green-500/20 text-green-500" : "bg-card border-red-500/20 text-red-500"
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-border/50 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                            ? "border-primary text-primary bg-primary/5"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">

                        {/* Global Settings */}
                        {activeTab === "global" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-primary" />
                                        Global SEO Settings
                                    </h2>
                                    <p className="text-sm text-muted-foreground">General settings that apply to the entire website.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">Site Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="Promptda"
                                                value={settings.site_title || ""}
                                                onChange={(e) => handleChange("site_title", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">The main name of your website.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">Title Separator</label>
                                            <select
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={settings.title_separator || "|"}
                                                onChange={(e) => handleChange("title_separator", e.target.value)}
                                            >
                                                <option value="|">|</option>
                                                <option value="-">-</option>
                                                <option value="•">•</option>
                                                <option value="»">»</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground">Character between page title and site name.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Meta Description Homepage</label>
                                        <textarea
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-y"
                                            placeholder="The best platform for..."
                                            value={settings.site_description || ""}
                                            onChange={(e) => handleChange("site_description", e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground flex justify-between">
                                            <span>Default description for the homepage.</span>
                                            <span className={`${(settings.site_description?.length || 0) > 160 ? "text-red-500" : "text-green-500"}`}>
                                                {settings.site_description?.length || 0}/160
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Global Keywords (Comma separated)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="saas, ai, tools, prompt engineering"
                                            value={settings.site_keywords || ""}
                                            onChange={(e) => handleChange("site_keywords", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Homepage Content Settings */}
                        {activeTab === "content" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <LayoutTemplate className="w-5 h-5 text-rose-500" />
                                            Homepage Content Translations
                                        </h2>
                                        <p className="text-sm text-muted-foreground">Manage the text content of the homepage hero section.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedLang !== 'en' && (
                                            <button
                                                onClick={() => handleAutoTranslate('Home')}
                                                disabled={isTranslating === 'Home'}
                                                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {isTranslating === 'Home' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                Translate from English
                                            </button>
                                        )}
                                        <select
                                            value={selectedLang}
                                            onChange={(e) => setSelectedLang(e.target.value)}
                                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="en">English (en)</option>
                                            <option value="de">German (de)</option>
                                            <option value="es">Spanish (es)</option>
                                            <option value="tr">Turkish (tr)</option>
                                        </select>
                                    </div>
                                </div>

                                {isMetadataLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-4 p-6 border border-border/50 rounded-xl bg-card">
                                            <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">Hero Section</h3>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Badge Text</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        value={metadata.Home?.verifiedLibrary || ""}
                                                        onChange={(e) => handleMetadataChange("Home", "verifiedLibrary", e.target.value)}
                                                        placeholder="Verified AI Prompt Library"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Share Image (Featured Image)</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm"
                                                            value={metadata.Home?.metaImage || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "metaImage", e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => { setMediaField({ section: 'Home', field: 'metaImage' }); setIsMediaModalOpen(true); }}
                                                            className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs"
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title Part 1 (Prefix)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            value={metadata.Home?.heroTitlePart1 || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "heroTitlePart1", e.target.value)}
                                                            placeholder="AI Prompt Library:"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-blue-500 uppercase tracking-widest">Title Part 2 (Highlighted)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-muted/30 border border-blue-500/30 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                            value={metadata.Home?.heroTitlePart2 || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "heroTitlePart2", e.target.value)}
                                                            placeholder="High-Quality"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title Part 3 (Suffix)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            value={metadata.Home?.heroTitlePart3 || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "heroTitlePart3", e.target.value)}
                                                            placeholder="ChatGPT & AI Prompts"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subtitle / Description</label>
                                                    <textarea
                                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                                                        value={metadata.Home?.heroSubtitle || ""}
                                                        onChange={(e) => handleMetadataChange("Home", "heroSubtitle", e.target.value)}
                                                        placeholder="Discover thousands of proven AI prompts..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Primary Button</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            value={metadata.Home?.explorePrompts || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "explorePrompts", e.target.value)}
                                                            placeholder="Explore Prompts"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Secondary Button</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            value={metadata.Home?.submitPrompt || ""}
                                                            onChange={(e) => handleMetadataChange("Home", "submitPrompt", e.target.value)}
                                                            placeholder="Submit a Prompt"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-border/50">
                                                    <h3 className="font-bold text-sm">Popular Categories Cards</h3>
                                                    <div className="space-y-4">
                                                        {(metadata.Home?.popularCategories || []).map((cat: any, index: number) => (
                                                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border rounded-xl bg-muted/20">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm"
                                                                        value={cat.title || ""}
                                                                        onChange={(e) => {
                                                                            const newCats = [...(metadata.Home?.popularCategories || [])];
                                                                            newCats[index] = { ...newCats[index], title: e.target.value };
                                                                            handleMetadataChange("Home", "popularCategories", newCats as any);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Icon (Lucide Name)</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm"
                                                                        value={cat.iconName || ""}
                                                                        onChange={(e) => {
                                                                            const newCats = [...(metadata.Home?.popularCategories || [])];
                                                                            newCats[index] = { ...newCats[index], iconName: e.target.value };
                                                                            handleMetadataChange("Home", "popularCategories", newCats as any);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-border/50">
                                                    <h3 className="font-bold text-sm">Footer "Goldmine" Links (One per line)</h3>
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[150px]"
                                                            value={(metadata.Home?.exploreByUseCaseLinks || []).join('\n')}
                                                            onChange={(e) => {
                                                                const links = e.target.value.split('\n');
                                                                handleMetadataChange("Home", "exploreByUseCaseLinks", links);
                                                            }}
                                                            placeholder="ChatGPT prompts for marketing..."
                                                        />
                                                        <p className="text-xs text-muted-foreground">These links appear at the bottom of the home page for SEO internal linking.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-border/50">
                                                    <h3 className="font-bold text-sm">FAQ Section</h3>
                                                    <div className="space-y-6">
                                                        {(metadata.Home?.faqs || []).map((faq: any, index: number) => (
                                                            <div key={index} className="space-y-3 p-4 border border-border rounded-xl bg-muted/20">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question {index + 1}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm"
                                                                        value={faq.question || ""}
                                                                        onChange={(e) => {
                                                                            const newFaqs = [...(metadata.Home?.faqs || [])];
                                                                            newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                                                                            handleMetadataChange("Home", "faqs", newFaqs as any);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Answer</label>
                                                                    <textarea
                                                                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm min-h-[60px]"
                                                                        value={faq.answer || ""}
                                                                        onChange={(e) => {
                                                                            const newFaqs = [...(metadata.Home?.faqs || [])];
                                                                            newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                                                                            handleMetadataChange("Home", "faqs", newFaqs as any);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const newFaqs = [...(metadata.Home?.faqs || []), { question: "", answer: "" }];
                                                                handleMetadataChange("Home", "faqs", newFaqs as any);
                                                            }}
                                                            className="text-sm font-bold text-primary hover:underline"
                                                        >
                                                            + Add FAQ Item
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Page Metadata Settings */}
                        {activeTab === "metadata" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Languages className="w-5 h-5 text-indigo-500" />
                                            Page Metadata Translations
                                        </h2>
                                        <p className="text-sm text-muted-foreground">Manage SEO titles and descriptions for core pages across languages.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={selectedLang}
                                            onChange={(e) => setSelectedLang(e.target.value)}
                                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="en">English (en)</option>
                                            <option value="de">German (de)</option>
                                            <option value="es">Spanish (es)</option>
                                            <option value="tr">Turkish (tr)</option>
                                        </select>
                                    </div>
                                </div>

                                {isMetadataLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(metadata).map(([section, data]: [string, any]) => {
                                            if (section === 'Home') return null; // Handled in Content tab
                                            return (
                                                <div key={section} className="p-6 border border-border/50 rounded-xl bg-card relative">
                                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                        <span className="w-2 h-8 rounded-full bg-primary/50 block"></span>
                                                        {section} Page
                                                    </h3>
                                                    {selectedLang !== 'en' && (
                                                        <button
                                                            onClick={() => handleAutoTranslate(section)}
                                                            disabled={isTranslating === section}
                                                            className="absolute top-4 right-4 flex items-center gap-2 text-primary hover:underline text-xs font-bold"
                                                        >
                                                            {isTranslating === section ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                            Auto-Translate
                                                        </button>
                                                    )}
                                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Share Image (Featured Image)</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-sm"
                                                                    value={data.metaImage || ""}
                                                                    onChange={(e) => handleMetadataChange(section, "metaImage", e.target.value)}
                                                                />
                                                                <button
                                                                    onClick={() => { setMediaField({ section, field: 'metaImage' }); setIsMediaModalOpen(true); }}
                                                                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs"
                                                                >
                                                                    Pick
                                                                </button>
                                                            </div>
                                                            {data.metaImage && (
                                                                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-border">
                                                                    <img src={data.metaImage} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Meta Title</label>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                                value={data.metaTitle || ""}
                                                                onChange={(e) => handleMetadataChange(section, "metaTitle", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Meta Description</label>
                                                            <textarea
                                                                className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                                                                value={data.metaDescription || ""}
                                                                onChange={(e) => handleMetadataChange(section, "metaDescription", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="pt-4 border-t border-border/50">
                                            <button
                                                onClick={handleSaveMetadata}
                                                disabled={isSaving}
                                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save All Translations ({selectedLang})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Indexing Settings */}
                        {activeTab === "indexing" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Search className="w-5 h-5 text-green-500" />
                                        Indexing & Crawling
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Control how search engines view and crawl your site.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Global Meta Robots</label>
                                        <select
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={settings.meta_robots_default || "index, follow"}
                                            onChange={(e) => handleChange("meta_robots_default", e.target.value)}
                                        >
                                            <option value="index, follow">index, follow (Recommended)</option>
                                            <option value="noindex, follow">noindex, follow</option>
                                            <option value="index, nofollow">index, nofollow</option>
                                            <option value="noindex, nofollow">noindex, nofollow</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="font-bold text-sm">Robots.txt Content</h3>
                                        <div className="bg-muted p-4 rounded-xl border border-border font-mono text-xs">
                                            <textarea
                                                className="w-full bg-transparent border-none focus:ring-0 outline-none resize-y min-h-[150px] text-foreground"
                                                value={settings.robots_txt || "User-agent: *\nAllow: /\n\nSitemap: https://promptda.com/sitemap.xml"}
                                                onChange={(e) => handleChange("robots_txt", e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Directly edit your virtual robots.txt content here.</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="font-bold text-sm text-red-500">Advanced Restrictions</h3>
                                        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={settings.noindex_categories === "true"}
                                                onChange={(e) => handleChange("noindex_categories", e.target.checked ? "true" : "false")}
                                            />
                                            <span className="text-sm">Noindex Categories pages</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={settings.noindex_tags === "true"}
                                                onChange={(e) => handleChange("noindex_tags", e.target.checked ? "true" : "false")}
                                            />
                                            <span className="text-sm">Noindex Tags pages</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Settings */}
                        {activeTab === "social" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Share2 className="w-5 h-5 text-blue-500" />
                                        Social Media Presence
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Configure how your site appears when shared on social networks.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Twitter Handle (@username)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="@yourstartup"
                                            value={settings.twitter_handle || ""}
                                            onChange={(e) => handleChange("twitter_handle", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Facebook App ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="1234567890"
                                            value={settings.facebook_app_id || ""}
                                            onChange={(e) => handleChange("facebook_app_id", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Default OG Image URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="https://example.com/og-default.jpg"
                                                value={settings.og_image || ""}
                                                onChange={(e) => handleChange("og_image", e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 rounded-xl font-bold text-xs transition-colors shrink-0"
                                            >
                                                Select Image
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Used when the shared page doesn't have a specific image.</p>
                                    </div>

                                    {settings.og_image && (
                                        <div className="mt-2 relative w-full h-48 rounded-xl overflow-hidden bg-muted border border-border">
                                            <img src={settings.og_image} alt="OG Preview" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Preview</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sitemap Settings */}
                        {activeTab === "sitemap" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                        XML Sitemap
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Configure your sitemap.xml generation.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20 text-sm flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Dynamic Sitemap Active</p>
                                            <p className="opacity-90">Your sitemap is automatically generated at <a href="/sitemap.xml" target="_blank" className="underline hover:text-sky-400">/sitemap.xml</a></p>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-sm pt-2">Content Inclusion</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { key: 'include_prompts', label: 'Prompts' },
                                            { key: 'include_scripts', label: 'Scripts' },
                                            { key: 'include_hooks', label: 'Hooks' },
                                            { key: 'include_tools', label: 'Tools' },
                                            { key: 'include_blog', label: 'Blog Posts' },
                                            { key: 'include_users', label: 'User Profiles' },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={settings[`sitemap_${item.key}`] !== "false"} // Default to true if not set
                                                    onChange={(e) => handleChange(`sitemap_${item.key}`, e.target.checked ? "true" : "false")}
                                                />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schema Settings */}
                        {activeTab === "schema" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Box className="w-5 h-5 text-purple-500" />
                                        Structured Data (Schema.org)
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Configure global JSON-LD schema for Organization and Website.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Organization Type</label>
                                        <select
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={settings.schema_org_type || "Organization"}
                                            onChange={(e) => handleChange("schema_org_type", e.target.value)}
                                        >
                                            <option value="Organization">Organization (Generic)</option>
                                            <option value="Corporation">Corporation</option>
                                            <option value="OnlineBusiness">Online Business</option>
                                            <option value="SoftwareApplication">Software Application</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Contact Phone</label>
                                        <input
                                            type="text"
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="+1-555-555-5555"
                                            value={settings.schema_phone || ""}
                                            onChange={(e) => handleChange("schema_phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">SameAs Links (Social Profiles)</label>
                                        <textarea
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-y font-mono"
                                            placeholder={`https://twitter.com/mysaas\nhttps://facebook.com/mysaas\nhttps://linkedin.com/company/mysaas`}
                                            value={settings.schema_same_as || ""}
                                            onChange={(e) => handleChange("schema_same_as", e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">One URL per line.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Indexing API Settings */}
                        {activeTab === "indexing_api" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                        IndexNow & Google Indexing API
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Force immediate indexing of your URLs to Google, Bing, and Yandex.</p>
                                </div>

                                <div className="space-y-8">
                                    {/* Google Indexing API Section */}
                                    <div className="space-y-4 p-5 border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Zap className="w-12 h-12" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                Google Indexing API
                                            </h3>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.google_indexing_enabled === "true"}
                                                    onChange={(e) => handleChange("google_indexing_enabled", e.target.checked ? "true" : "false")}
                                                />
                                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">Service Account JSON Key</label>
                                            <textarea
                                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[150px]"
                                                placeholder='{ "type": "service_account", ... }'
                                                value={settings.google_service_account_json || ""}
                                                onChange={(e) => handleChange("google_service_account_json", e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                1. Create a Project on Google Cloud Console.<br />
                                                2. Enable Indexing API.<br />
                                                3. Create a Service Account, generate a JSON Key and paste it here.<br />
                                                4. Add the Service Account email to your Search Console as an Owner.
                                            </p>
                                        </div>
                                    </div>

                                    {/* IndexNow Section */}
                                    <div className="space-y-4 p-5 border border-blue-500/20 bg-blue-500/5 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Rocket className="w-12 h-12" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg flex items-center gap-2 text-blue-500">
                                                IndexNow (Bing / Yandex)
                                            </h3>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.indexnow_enabled === "true"}
                                                    onChange={(e) => handleChange("indexnow_enabled", e.target.checked ? "true" : "false")}
                                                />
                                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-muted-foreground">IndexNow Key</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                    placeholder="example: 456b8e..."
                                                    value={settings.indexnow_key || ""}
                                                    onChange={(e) => handleChange("indexnow_key", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-muted-foreground">API Host</label>
                                                <select
                                                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm"
                                                    value={settings.indexnow_host || "www.bing.com"}
                                                    onChange={(e) => handleChange("indexnow_host", e.target.value)}
                                                >
                                                    <option value="api.indexnow.org">indexnow.org (Hub)</option>
                                                    <option value="www.bing.com">Bing (bing.com)</option>
                                                    <option value="yandex.com">Yandex (yandex.com)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            IndexNow notifies search engines instantly about content changes.
                                            Make sure key file is accessible at <code>/{settings.indexnow_key || 'your-key'}.txt</code>
                                        </p>
                                    </div>

                                    {/* Manual Submission Section */}
                                    <div className="space-y-4 p-5 border border-purple-500/20 bg-purple-500/5 rounded-2xl">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Search className="w-5 h-5 text-purple-500" />
                                            Manual URL Submission
                                        </h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                id="manual_url"
                                                className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://promptda.com/prompts/my-awesome-prompt"
                                            />
                                            <button
                                                onClick={async () => {
                                                    const input = document.getElementById('manual_url') as HTMLInputElement;
                                                    const url = input.value;
                                                    if (!url) return;

                                                    setIsSaving(true);
                                                    try {
                                                        const { submitToGoogleIndexing, submitToIndexNow } = await import('@/actions/indexing');
                                                        const gRes = await submitToGoogleIndexing(url);
                                                        const iRes = await submitToIndexNow(url);

                                                        const combinedMsg = `Google: ${gRes.success ? 'OK' : (gRes.error || 'Err')}, IndexNow: ${iRes.success ? 'OK' : (iRes.error || 'Err')}`;
                                                        setMessage({ type: 'success', text: combinedMsg });
                                                    } catch (e: any) {
                                                        setMessage({ type: 'error', text: e.message });
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                                            >
                                                Ping Now
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Submit any URL to both Google and IndexNow (Bing/Yandex) immediately.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Advanced Settings */}
                        {activeTab === "advanced" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1 pb-4 border-b border-border/50">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-gray-500" />
                                        Advanced Configuration
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Canonical URLs and granular controls.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Clean Canonical Params</label>
                                        <input
                                            type="text"
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                                            placeholder="utm_source, ref, tracking_id"
                                            value={settings.canonical_clean_params || ""}
                                            onChange={(e) => handleChange("canonical_clean_params", e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">URL parameters to strip from canonical tags (comma separated).</p>
                                    </div>

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={settings.force_trailing_slash === "true"}
                                            onChange={(e) => handleChange("force_trailing_slash", e.target.checked ? "true" : "false")}
                                        />
                                        <span className="text-sm">Force Trailing Slash (Recommended for most Next.js setups)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-muted-foreground">
                            {isSaving ? "Saving changes..." : "All changes are saved to database immediately on save."}
                        </p>
                        <button
                            onClick={() => handleSave(activeTab)}
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            SEO Health
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Sitemap</span>
                                <span className="text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Robots.txt</span>
                                <span className="text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Configured</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Meta Tags</span>
                                <span className="text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Optimized</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleAction('clear_cache')}
                                disabled={isSaving}
                                className="w-full bg-background hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-between group"
                            >
                                Clear SEO Cache
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleAction('regenerate_sitemap')}
                                disabled={isSaving}
                                className="w-full bg-background hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-between group"
                            >
                                Re-build Sitemap
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Selector Modal */}
            <AnimatePresence>
                {isMediaModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div
                            className="bg-background border border-border w-full max-w-5xl h-[800px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    Select Image
                                </h3>
                                <button
                                    onClick={() => setIsMediaModalOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden p-6 bg-card">
                                <MediaLibrary
                                    onSelect={(url) => {
                                        if (mediaField) {
                                            if (mediaField.section === 'settings') {
                                                handleChange(mediaField.field, url);
                                            } else {
                                                handleMetadataChange(mediaField.section, mediaField.field, url);
                                            }
                                        } else {
                                            handleChange("og_image", url);
                                        }
                                        setIsMediaModalOpen(false);
                                        setMediaField(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
