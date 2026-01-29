"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, ExternalLink, AlertCircle, CheckCircle2, RefreshCw, Loader2, Plus } from "lucide-react";

interface RedirectRule {
    id: string;
    source: string;
    destination: string;
    code: number;
    isActive: boolean;
    isWildcard: boolean;
    createdAt: string;
}

export default function RedirectsPage({ params }: { params: Promise<{ lang: string }> }) {
    const [redirects, setRedirects] = useState<RedirectRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [newSource, setNewSource] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCode, setNewCode] = useState(301);
    const [isWildcard, setIsWildcard] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/redirects");
            if (res.ok) {
                const data = await res.json();
                setRedirects(data);
            }
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/admin/redirects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: newSource,
                    destination: newCode === 410 ? "" : newDesc,
                    code: newCode,
                    isWildcard
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create redirect");
            }

            setMessage({ type: 'success', text: "Redirect rule created!" });
            setNewSource("");
            setNewDesc("");
            fetchRedirects(); // Refresh list

            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this redirect rule?")) return;

        try {
            const res = await fetch(`/api/admin/redirects?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setRedirects(prev => prev.filter(r => r.id !== id));
                setMessage({ type: 'success', text: "Rule deleted" });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/en/admin/seo" className="text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Redirect Manager</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage 301 and 302 redirects for your application.</p>
                </div>
                <button
                    onClick={fetchRedirects}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Refresh List"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border ${message.type === 'success' ? "bg-card border-green-500/20 text-green-500" : "bg-card border-red-500/20 text-red-500"
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-primary" />
                            Add New Redirect
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Redirect Action</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewCode(301)}
                                        className={`px-2 py-2 rounded-xl text-xs font-bold border transition-colors ${newCode === 301 ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"}`}
                                    >
                                        301 (Permanent)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCode(302)}
                                        className={`px-2 py-2 rounded-xl text-xs font-bold border transition-colors ${newCode === 302 ? "bg-yellow-500 text-white border-yellow-500" : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"}`}
                                    >
                                        302 (Temporary)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCode(410)}
                                        className={`px-2 py-2 rounded-xl text-xs font-bold border transition-colors ${newCode === 410 ? "bg-red-500 text-white border-red-500" : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"}`}
                                    >
                                        410 (Gone)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Source URL (From)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="/old-page"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={newSource}
                                    onChange={e => setNewSource(e.target.value)}
                                />
                            </div>

                            {newCode !== 410 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Destination URL (To)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="/new-page"
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                    />
                                </div>
                            )}

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={isWildcard}
                                    onChange={(e) => setIsWildcard(e.target.checked)}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Wildcard Match</span>
                                    <span className="text-[10px] text-muted-foreground">Matches all sub-paths (e.g. /blog/*)</span>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Create Rule
                            </button>
                        </form>
                    </div>
                </div>

                {/* Redirects List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-foreground">Active Redirect Rules</h2>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{redirects.length} Rules</span>
                        </div>

                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : redirects.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No redirects found.</p>
                                <p className="text-sm opacity-60">Create your first redirect rule using the form.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {redirects.map((rule) => (
                                    <div key={rule.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className={`px-2 py-1 rounded text-xs font-bold border ${rule.code === 301 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}>
                                                {rule.code}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 text-sm font-medium font-mono flex-wrap">
                                                    <span className="truncate max-w-[150px] md:max-w-[200px]" title={rule.source}>{rule.source}</span>
                                                    {rule.isWildcard && (
                                                        <span className="bg-purple-500/10 text-purple-500 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20 uppercase font-bold">Wildcard</span>
                                                    )}
                                                    <span className="text-muted-foreground">→</span>
                                                    {rule.code === 410 ? (
                                                        <span className="text-red-500 font-bold text-xs uppercase">Gone (410)</span>
                                                    ) : (
                                                        <span className="truncate max-w-[150px] md:max-w-[200px] text-primary" title={rule.destination}>{rule.destination}</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                    <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                                                    {rule.isActive ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={rule.source} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm flex gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>
                            <strong>Note:</strong> For these redirects to work, they must be handled by the middleware. Ensure your `middleware.ts` is configured to check the database or a cache for these rules.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
