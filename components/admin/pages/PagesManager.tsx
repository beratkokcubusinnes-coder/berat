
"use client";

import { useEffect, useState } from "react";
import { getAllStaticPages, updateStaticPage } from "@/actions/admin/pages";
import { Edit, Save, Loader2, Link as LinkIcon, Eye, EyeOff, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaticPage {
    slug: string;
    title: string;
    content: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isActive: boolean;
}

export function PagesManager() {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState<Partial<StaticPage>>({});

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        setLoading(true);
        const data = await getAllStaticPages();
        // Fallback for initial state if DB is empty
        if (data.length === 0) {
            const defaults = [
                { slug: "about", title: "About Us", content: "Welcome to Promptda...", isActive: true },
                { slug: "terms", title: "Terms of Service", content: "Terms...", isActive: true },
                { slug: "privacy", title: "Privacy Policy", content: "Privacy...", isActive: true },
                { slug: "contact", title: "Contact Us", content: "Contact...", isActive: true },
            ] as StaticPage[];
            setPages(defaults);
        } else {
            setPages(data as StaticPage[]);
        }
        setLoading(false);
    };

    const handleEdit = (page: StaticPage) => {
        setSelectedPage(page.slug);
        setEditForm({ ...page });
    };

    const handleSave = async () => {
        if (!selectedPage || !editForm.title) return;

        setSaving(true);
        const result = await updateStaticPage(selectedPage, {
            title: editForm.title,
            content: editForm.content || "",
            metaTitle: editForm.metaTitle || undefined,
            metaDescription: editForm.metaDescription || undefined,
            isActive: editForm.isActive
        });

        if (result.success) {
            // Refresh list
            if (result.page) {
                const newPages = [...pages];
                const idx = newPages.findIndex(p => p.slug === selectedPage);
                if (idx >= 0) {
                    newPages[idx] = result.page as StaticPage;
                } else {
                    newPages.push(result.page as StaticPage);
                }
                setPages(newPages);
            } else {
                // If we used default values (not in DB yet) and saved
                loadPages();
            }
        }
        setSaving(false);
        // Don't close, let them keep editing
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar List */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <h2 className="text-lg font-bold mb-4">Static Pages</h2>
                    <div className="space-y-2">
                        {pages.map((page) => (
                            <button
                                key={page.slug}
                                onClick={() => handleEdit(page)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all",
                                    selectedPage === page.slug
                                        ? "bg-primary/20 text-primary font-bold border border-primary/20"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    {page.title}
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider opacity-60">/{page.slug}</span>
                                </span>
                                {selectedPage === page.slug && <Edit className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-2">
                {selectedPage ? (
                    <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between border-b border-border/50 pb-4">
                            <div>
                                <h3 className="text-xl font-black">{editForm.title}</h3>
                                <p className="text-sm text-muted-foreground">Editing content for /{editForm.slug}</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Page Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={editForm.title || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors",
                                                editForm.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}
                                        >
                                            {editForm.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {editForm.isActive ? "Published" : "Hidden"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Content (Markdown/HTML)</label>
                                <textarea
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none min-h-[400px]"
                                    value={editForm.content || ""}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="# Heading..."
                                />
                            </div>

                            <div className="pt-4 border-t border-border/50 space-y-4">
                                <h4 className="text-sm font-bold opacity-70">SEO Meta Data</h4>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Meta Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={editForm.metaTitle || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Meta Description</label>
                                    <textarea
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                                        value={editForm.metaDescription || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/10 border border-border/50 border-dashed rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a page to edit content</p>
                    </div>
                )}
            </div>
        </div>
    );
}
