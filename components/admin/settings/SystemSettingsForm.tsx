"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Settings, Shield, ShieldAlert, BarChart3,
    Image as ImageIcon, Save, Loader2, Info,
    AlertTriangle, CheckCircle2, Globe, Clock,
    Lock, UserPlus, Eye, MessageSquare, Terminal,
    FileCode, Upload, Ban, Filter, HardDrive,
    Menu, GripVertical, Plus, Trash2, Compass,
    Sparkles, FileCode2, Anchor, Users, Wrench,
    MessageCircle, BookOpen, Heart, Search, Bell,
    Type, Link as LinkIcon, Library, Rss
} from "lucide-react";
import { updateSystemSettings } from "@/actions/settings";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { MediaLibrary } from "./MediaLibrary";

type Tab = "general" | "limits" | "security" | "moderation" | "seo" | "rss" | "navigation" | "appearance" | "storage" | "media";

const ICON_MAP: Record<string, any> = {
    Compass, Sparkles, FileCode2, Anchor, Users, Wrench,
    MessageCircle, BookOpen, Heart, Search, Bell, Settings,
    BarChart3, Shield, Info, Terminal, Globe, Lock, ImageIcon
};

export default function SystemSettingsForm({ initialSettings, initialMedia }: { initialSettings: any, initialMedia: any[] }) {
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialSettings.default_avatar);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.site_logo);
    const [iconPreview, setIconPreview] = useState<string | null>(initialSettings.site_icon);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(initialSettings.site_favicon);

    // Navigation State
    const [sidebarMenu, setSidebarMenu] = useState<any[]>(() => {
        try { return JSON.parse(initialSettings.navigation_sidebar || "[]"); }
        catch { return []; }
    });
    const [headerMenu, setHeaderMenu] = useState<any[]>(() => {
        try { return JSON.parse(initialSettings.navigation_header || "[]"); }
        catch { return []; }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        // Append JSON strings for navigation
        formData.append("navigation_sidebar", JSON.stringify(sidebarMenu));
        formData.append("navigation_header", JSON.stringify(headerMenu));

        try {
            const res = await updateSystemSettings(formData);
            if (res.error) {
                alert(res.error);
            } else {
                alert("Deep-level system configuration committed successfully.");
            }
        } catch (error) {
            alert("An error occurred while saving.");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: "general", label: "General", icon: Globe, color: "text-blue-500" },
        { id: "navigation", label: "Menus & Nav", icon: Menu, color: "text-amber-500" },
        { id: "limits", label: "Quotas", icon: BarChart3, color: "text-orange-500" },
        { id: "security", label: "Security", icon: ShieldAlert, color: "text-red-500" },
        { id: "moderation", label: "Moderation", icon: Filter, color: "text-purple-500" },
        { id: "seo", label: "SEO & Scripts", icon: FileCode, color: "text-emerald-500" },
        { id: "rss", label: "RSS Feed", icon: Rss, color: "text-orange-400" },
        { id: "storage", label: "Storage", icon: HardDrive, color: "text-cyan-500" },
        { id: "media", label: "Media Library", icon: Library, color: "text-indigo-500" },
        { id: "appearance", label: "Visuals", icon: ImageIcon, color: "text-pink-500" },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="flex flex-col lg:flex-row min-h-[850px]">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 border-r border-border bg-muted/20 p-6 space-y-2 shrink-0">
                    <div className="px-4 py-2 mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Core System</h3>
                    </div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-foreground text-background shadow-xl translate-x-1"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab !== tab.id && tab.color)} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-12 space-y-10 relative bg-gradient-to-br from-transparent to-muted/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* TAB: GENERAL */}
                            {activeTab === "general" && (
                                <div className="space-y-8">
                                    <SectionHeader
                                        title="Platform Identity"
                                        description="Master control for core registration status and global behavior."
                                    />
                                    <div className="grid grid-cols-1 gap-6">
                                        <SettingField label="Platform Name" description="The official name of your platform. Updates headers, emails, and meta titles.">
                                            <input name="site_name" defaultValue={initialSettings.site_name} className="input-premium" placeholder="Promptda" />
                                        </SettingField>
                                        <ToggleControl
                                            name="enable_registration"
                                            label="Public Registration"
                                            description="If disabled, only admins can create new user accounts through the dashboard."
                                            defaultValue={initialSettings.enable_registration}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: NAVIGATION */}
                            {activeTab === "navigation" && (
                                <div className="space-y-12">
                                    <SectionHeader
                                        title="Navigation Orchestrator"
                                        description="Drag and drop elements to reorganize the platform architecture. Changes reflect instantly."
                                    />

                                    {/* Sidebar Menu Configuration */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                    <Menu className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <h3 className="font-black text-xs uppercase tracking-widest">Sidebar Navigation</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSidebarMenu([...sidebarMenu, { id: Math.random().toString(36).substr(2, 5), name: "New Link", icon: "LinkIcon", href: "/" }])}
                                                className="p-2 hover:bg-muted rounded-xl transition-colors text-primary"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <Reorder.Group axis="y" values={sidebarMenu} onReorder={setSidebarMenu} className="space-y-2">
                                            {sidebarMenu.map((item) => (
                                                <Reorder.Item key={item.id} value={item}>
                                                    <div className="flex items-center gap-4 bg-background border border-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                                                        <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/30 hover:text-foreground">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                            {(() => {
                                                                const IconComp = ICON_MAP[item.icon] || LinkIcon;
                                                                return <IconComp className="w-4 h-4" />;
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                                            <input
                                                                value={item.name}
                                                                onChange={(e) => setSidebarMenu(sidebarMenu.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                                                                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                                                placeholder="Label"
                                                            />
                                                            <input
                                                                value={item.href}
                                                                onChange={(e) => setSidebarMenu(sidebarMenu.map(i => i.id === item.id ? { ...i, href: e.target.value } : i))}
                                                                className="bg-transparent border-none p-0 text-xs text-muted-foreground font-mono focus:ring-0"
                                                                placeholder="/path"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSidebarMenu(sidebarMenu.filter(i => i.id !== item.id))}
                                                            className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>

                                    {/* Header Actions Configuration */}
                                    <div className="space-y-6 pt-6 border-t border-border">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <h3 className="font-black text-xs uppercase tracking-widest">Header Components</h3>
                                        </div>

                                        <Reorder.Group axis="y" values={headerMenu} onReorder={setHeaderMenu} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {headerMenu.map((item) => (
                                                <Reorder.Item key={item.id} value={item}>
                                                    <div className="flex items-center gap-4 bg-muted/30 border border-border/50 p-4 rounded-2xl group">
                                                        <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/30 hover:text-foreground">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-black uppercase tracking-widest mb-1">{item.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-lg bg-background text-[10px] font-bold border border-border text-muted-foreground italic">
                                                                    System {item.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ToggleSwitch
                                                            checked={!item.hidden}
                                                            onChange={(val) => setHeaderMenu(headerMenu.map(i => i.id === item.id ? { ...i, hidden: !val } : i))}
                                                        />
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                </div>
                            )}

                            {/* TAB: LIMITS */}
                            {activeTab === "limits" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Resource Quotas" description="Configure granular daily usage limits for different activity types." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <QuotaInput name="daily_prompt_limit" label="Daily Prompt Limit" icon={Terminal} defaultValue={initialSettings.daily_prompt_limit} />
                                        <QuotaInput name="daily_community_post_limit" label="Community Thread Limit" icon={MessageSquare} defaultValue={initialSettings.daily_community_post_limit} />
                                        <QuotaInput name="daily_comment_limit" label="Comment Frequency Limit" icon={MessageSquare} defaultValue={initialSettings.daily_comment_limit} />
                                    </div>
                                </div>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === "security" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Spam & Integrity" description="Heuristic controls to mitigate automated attacks and flooding." />
                                    <div className="space-y-4">
                                        <SettingField label="Global Post Cooldown" description="Minimum minutes required between any creative action (Post/Prompt/Comment).">
                                            <div className="flex items-center gap-4">
                                                <input name="post_cool_down_minutes" type="number" defaultValue={initialSettings.post_cool_down_minutes} className="input-premium w-32" />
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Minutes</span>
                                            </div>
                                        </SettingField>
                                        <SettingField label="New User Sandbox (Hours)" description="Restrict posting permissions for this many hours after registration.">
                                            <div className="flex items-center gap-4">
                                                <input name="new_user_restriction_hours" type="number" defaultValue={initialSettings.new_user_restriction_hours} className="input-premium w-32" />
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hours</span>
                                            </div>
                                        </SettingField>
                                        <ToggleControl
                                            name="maintenance_mode"
                                            label="Maintenance Protocol"
                                            variant="danger"
                                            description="LOCK THE ENTIRE SITE. Only administrators will have login access."
                                            defaultValue={initialSettings.maintenance_mode}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: MODERATION */}
                            {activeTab === "moderation" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Content Moderation" description="Fine-tune how user-generated content is filtered and approved." />
                                    <div className="space-y-6">
                                        <ToggleControl
                                            name="auto_approve_threads"
                                            label="Auto-Approve Community Threads"
                                            defaultValue={initialSettings.auto_approve_threads}
                                        />
                                        <ToggleControl
                                            name="auto_approve_comments"
                                            label="Auto-Approve Comments"
                                            defaultValue={initialSettings.auto_approve_comments}
                                        />
                                        <SettingField label="Keyword Blacklist" description="Comma-separated list of words that will trigger automatic hiding or flag posts.">
                                            <textarea name="word_blacklist" defaultValue={initialSettings.word_blacklist} rows={4} className="input-premium py-3 resize-none font-mono text-xs" placeholder="spam, crypto, adult, etc..." />
                                        </SettingField>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SEO & SCRIPTS */}
                            {activeTab === "seo" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Integrations" description="Connect third-party analytics and inject custom code into the platform." />
                                    <div className="space-y-6">
                                        <SettingField label="Google Analytics ID" description="Measurement ID (G-XXXXXXXXXX) for GA4.">
                                            <input name="google_analytics_id" defaultValue={initialSettings.google_analytics_id} className="input-premium" placeholder="G-XXXXXXXXXX" />
                                        </SettingField>
                                        <SettingField label="Head Script Injection" description="Custom meta tags or tracking pixels to be injected into the <head>.">
                                            <textarea name="meta_tags_extra" defaultValue={initialSettings.meta_tags_extra} rows={3} className="input-premium py-3 resize-none font-mono text-xs" placeholder="<!-- Meta tags or head scripts -->" />
                                        </SettingField>
                                        <SettingField label="Footer Code Injection" description="Safe area for chat widgets or external library scripts.">
                                            <textarea name="custom_footer_script" defaultValue={initialSettings.custom_footer_script} rows={3} className="input-premium py-3 resize-none font-mono text-xs" placeholder="<!-- Widget scripts -->" />
                                        </SettingField>
                                    </div>
                                </div>
                            )}

                            {/* TAB: RSS FEED */}
                            {activeTab === "rss" && (
                                <div className="space-y-8">
                                    <SectionHeader title="RSS Syndication" description="Configure how your site distributes content to external aggregators and readers." />
                                    <div className="space-y-6">
                                        <SettingField label="Feed Title" description="The title of your RSS feed as it appears in readers.">
                                            <input name="rss_feed_title" defaultValue={initialSettings.rss_feed_title} className="input-premium" placeholder="Promptda RSS Feed" />
                                        </SettingField>
                                        <SettingField label="Feed Description" description="A brief summary of what's included in the feed.">
                                            <textarea name="rss_feed_description" defaultValue={initialSettings.rss_feed_description} rows={3} className="input-premium py-3 resize-none font-medium text-xs" />
                                        </SettingField>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <SettingField label="Global Limit" description="Maximum number of total items (Prompts, Blog, etc.) in the feed.">
                                                <input name="rss_feed_limit" type="number" defaultValue={initialSettings.rss_feed_limit} className="input-premium" />
                                            </SettingField>
                                            <SettingField label="Feed Language" description="RFC-1766 language tag (e.g., en-us, tr-tr).">
                                                <input name="rss_feed_language" defaultValue={initialSettings.rss_feed_language} className="input-premium" placeholder="en-us" />
                                            </SettingField>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-500">
                                                <Info className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Feed Location</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Your primary RSS feed is located at:
                                                    <a href="/rss.xml" target="_blank" className="ml-2 font-mono text-primary hover:underline underline-offset-4">/rss.xml</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: STORAGE */}
                            {activeTab === "storage" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Asset Management" description="Control site storage usage and cloud asset parameters." />
                                    <div className="space-y-6">
                                        <SettingField label="Max Asset Size (MB)" description="Hard limit for profile pictures and community attachments.">
                                            <div className="flex items-center gap-4">
                                                <input name="max_image_upload_size_mb" type="number" defaultValue={initialSettings.max_image_upload_size_mb} className="input-premium w-32" />
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MB</span>
                                            </div>
                                        </SettingField>
                                        <SettingField label="Permitted MIME Types" description="Comma-separated list of allowed file formats.">
                                            <input name="allowed_image_types" defaultValue={initialSettings.allowed_image_types} className="input-premium" />
                                        </SettingField>
                                    </div>
                                </div>
                            )}

                            {/* TAB: APPEARANCE */}
                            {activeTab === "appearance" && (
                                <div className="space-y-8">
                                    <SectionHeader title="Global Asset Defaults" description="Manage system-level images used across the user interface." />
                                    <div className="flex flex-col md:flex-row items-center gap-10 p-8 rounded-3xl bg-muted/30 border border-border/50">
                                        <div className="relative group shrink-0">
                                            <UserAvatar src={avatarPreview} alt="Default Avatar" size={120} className="ring-8 ring-background shadow-2xl transition-transform group-hover:scale-105" />
                                            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white">
                                                <Upload className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] uppercase font-black tracking-tighter">Replace</span>
                                                <input type="file" name="default_avatar_file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-xl text-foreground">Global Fallback Avatar</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                                                This high-resolution placeholder is used site-wide for any profile without an active avatar.
                                                Recommended: 512x512 PNG with solid background.
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-mono font-bold text-muted-foreground truncate max-w-[200px]">
                                                    {initialSettings.default_avatar}
                                                </span>
                                            </div>

                                            {/* Logo & Branding Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                                {/* Site Logo */}
                                                <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Main Site Logo</h3>
                                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="relative group aspect-[3/1] bg-background rounded-2xl border border-border flex items-center justify-center p-6 overflow-hidden">
                                                        {logoPreview ? (
                                                            <img src={logoPreview} alt="Site Logo" className="max-h-full max-w-full object-contain" />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground uppercase font-black">No Logo</span>
                                                        )}
                                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
                                                            <Upload className="w-5 h-5 mb-1" />
                                                            <span className="text-[10px] uppercase font-black">Upload Logo</span>
                                                            <input type="file" name="site_logo_file" accept="image/*" className="hidden"
                                                                onChange={(e) => e.target.files?.[0] && setLogoPreview(URL.createObjectURL(e.target.files[0]))} />
                                                        </label>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Used in the navigation bar and authentication pages. Recommend horizontal orientation.
                                                    </p>
                                                </div>

                                                {/* Site Icon */}
                                                <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Square Asset (Icon)</h3>
                                                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex items-start gap-6">
                                                        <div className="relative group w-24 h-24 bg-background rounded-3xl border border-border flex items-center justify-center p-4 overflow-hidden shadow-lg shadow-black/5">
                                                            {iconPreview ? (
                                                                <img src={iconPreview} alt="Site Icon" className="max-h-full max-w-full object-contain" />
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground font-black">ICON</span>
                                                            )}
                                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
                                                                <Upload className="w-4 h-4" />
                                                                <input type="file" name="site_icon_file" accept="image/*" className="hidden"
                                                                    onChange={(e) => e.target.files?.[0] && setIconPreview(URL.createObjectURL(e.target.files[0]))} />
                                                            </label>
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                                Square icon used for social sharing and mobile app shortcuts.
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Favicon (.ico)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative group w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center p-2 overflow-hidden shrink-0">
                                                                        {faviconPreview ? (
                                                                            <img src={faviconPreview} className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                                        )}
                                                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer text-white">
                                                                            <Upload className="w-3 h-3" />
                                                                            <input type="file" name="site_favicon_file" accept=".ico,.png,image/*" className="hidden"
                                                                                onChange={(e) => e.target.files?.[0] && setFaviconPreview(URL.createObjectURL(e.target.files[0]))} />
                                                                        </label>
                                                                    </div>
                                                                    <input name="site_favicon" defaultValue={initialSettings.site_favicon} className="input-premium py-2 text-xs flex-1" placeholder="/favicon.ico" readOnly />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">Upload a 32x32px .ico or .png file.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: MEDIA */}
                            {activeTab === "media" && (
                                <div className="space-y-8 h-full">
                                    <SectionHeader
                                        title="Media Repository"
                                        description="Advanced asset management. Edit SEO metadata, alt texts, and track all site-wide uploads in one central matrix."
                                    />
                                    <MediaLibrary initialMedia={initialMedia} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="pt-8 mt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted/50 border border-border/50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Live Status: 200 OK</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-foreground text-background font-black px-12 py-4 rounded-2xl hover:bg-foreground/90 transition-all active:scale-95 shadow-2xl shadow-foreground/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            COMMIT NEW CONFIGURATION
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .input-premium {
                    @apply w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm font-medium focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 outline-none transition-all duration-300;
                }
            `}</style>
        </form>
    );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-black text-foreground tracking-tight">{title}</h2>
            <p className="text-muted-foreground max-w-2xl text-balance leading-relaxed">{description}</p>
        </div>
    );
}

function SettingField({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2 grid grid-cols-1">
            <div className="flex flex-col mb-1">
                <span className="text-sm font-black text-foreground uppercase tracking-widest mb-0.5">{label}</span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">{description}</span>
            </div>
            {children}
        </div>
    );
}

function QuotaInput({ name, label, icon: Icon, defaultValue }: { name: string; label: string; icon: any; defaultValue: any }) {
    return (
        <div className="group relative p-6 rounded-3xl bg-background border border-border hover:border-foreground/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-muted group-hover:bg-foreground transition-colors flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground group-hover:text-background transition-colors" />
                </div>
                <span className="text-sm font-black text-foreground uppercase tracking-wider">{label}</span>
            </div>
            <input
                name={name}
                type="number"
                defaultValue={defaultValue}
                className="w-full text-2xl font-black bg-transparent outline-none border-none p-0 focus:ring-0"
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );
}

function ToggleControl({ name, label, description, defaultValue, variant = "default" }: { name: string; label: string; description?: string; defaultValue: any; variant?: "default" | "danger" }) {
    return (
        <div className={cn(
            "flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-3xl border transition-all duration-300",
            variant === "danger" ? "bg-red-500/5 border-red-500/10 hover:border-red-500/20" : "bg-muted/30 border-border/50 hover:border-border"
        )}>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {variant === "danger" ? <Ban className="w-4 h-4 text-red-500" /> : <Settings className="w-4 h-4 text-primary" />}
                    <h3 className={cn("font-black uppercase tracking-widest text-xs", variant === "danger" ? "text-red-500" : "text-foreground")}>{label}</h3>
                </div>
                {description && <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{description}</p>}
            </div>
            <select
                name={name}
                defaultValue={defaultValue}
                className={cn(
                    "bg-background border rounded-2xl px-5 py-2 text-xs font-black shadow-sm outline-none focus:ring-4",
                    variant === "danger" ? "border-red-500/20 focus:ring-red-500/10 text-red-500" : "border-border focus:ring-foreground/5"
                )}
            >
                <option value="true">{variant === "danger" ? "ACTIVE" : "ENABLED"}</option>
                <option value="false">{variant === "danger" ? "INACTIVE" : "DISABLED"}</option>
            </select>
        </div>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "w-10 h-6 shrink-0 rounded-full transition-colors relative",
                checked ? "bg-primary" : "bg-muted"
            )}
        >
            <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                checked ? "left-5" : "left-1"
            )} />
        </button>
    );
}
