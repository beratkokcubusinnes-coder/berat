"use client";

import { useState, useEffect } from "react";
import { getUnusedMedia, deleteBulkMedia } from "@/actions/media";
import { Trash2, Image as ImageIcon, CheckCircle, ExternalLink, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaManagement({ lang }: { lang: string }) {
    const [media, setMedia] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadMedia = async () => {
        setIsLoading(true);
        try {
            const data = await getUnusedMedia();
            setMedia(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
    }, []);

    const toggleSelect = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === media.length) setSelected([]);
        else setSelected(media.map(m => m.id));
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selected.length} unused files?`)) return;

        setIsDeleting(true);
        try {
            await deleteBulkMedia(selected);
            setSelected([]);
            await loadMedia();
        } catch (error) {
            console.error(error);
            alert("Failed to delete some files");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const totalSaved = media
        .filter(m => selected.includes(m.id))
        .reduce((acc, m) => acc + (m.size || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-xl shadow-black/5">
                <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-primary" /> Unused Media Library
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">These files are currently not referenced by any content in your system.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadMedia}
                        disabled={isLoading}
                        className="p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-all"
                    >
                        <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                    </button>
                    {selected.length > 0 && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete {selected.length} Selected ({formatSize(totalSaved)})
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : media.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <button
                            onClick={toggleSelectAll}
                            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                        >
                            {selected.length === media.length ? "Deselect All" : "Select All Unused"}
                        </button>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {media.length} files found
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelect(item.id)}
                                className={cn(
                                    "group relative bg-card border-2 rounded-2xl overflow-hidden aspect-square cursor-pointer transition-all duration-300",
                                    selected.includes(item.id) ? "border-primary ring-4 ring-primary/10 shadow-lg" : "border-border hover:border-primary/50"
                                )}
                            >
                                <img
                                    src={item.url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay Card Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <p className="text-[10px] text-white font-bold truncate mb-0.5">{item.filename}</p>
                                    <p className="text-[8px] text-white/70 font-bold uppercase tracking-widest">{formatSize(item.size)}</p>
                                </div>

                                {/* Selection Checkmark */}
                                <div className={cn(
                                    "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                    selected.includes(item.id) ? "bg-primary scale-110" : "bg-black/20 backdrop-blur-md opacity-0 group-hover:opacity-100"
                                )}>
                                    <CheckCircle className={cn("w-4 h-4", selected.includes(item.id) ? "text-white" : "text-white/50")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-[2.5rem] py-24 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">System is Clean!</h3>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">No unused media files found.</p>
                </div>
            )}
        </div>
    );
}
