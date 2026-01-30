"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Image as ImageIcon,
    Upload,
    Search,
    Trash2,
    Edit3,
    X,
    Check,
    Info,
    Crop,
    Type,
    FileText,
    Calendar,
    HardDrive
} from "lucide-react";
import { getMedia, updateMedia, deleteMedia, uploadMedia } from "@/actions/media";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export function MediaLibrary({ initialMedia = [] }: { initialMedia?: any[] }) {
    const [media, setMedia] = useState<any[]>(initialMedia);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!initialMedia.length) {
            loadMedia();
        } else {
            setLoading(false);
        }
    }, [initialMedia]);

    const loadMedia = async () => {
        setLoading(true);
        const data = await getMedia();
        setMedia(data);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadMedia(formData);
            if (res.success) {
                setMedia([res.data, ...media]);
                setSelectedItem(res.data);
            } else {
                alert(res.error || "Upload failed");
            }
        } catch (error) {
            alert("An error occurred during upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedItem) return;
        setIsUpdating(true);
        const res = await updateMedia(selectedItem.id, {
            altText: selectedItem.altText,
            caption: selectedItem.caption,
            description: selectedItem.description
        });
        if (res.success) {
            setMedia(media.map(m => m.id === selectedItem.id ? res.data : m));
            alert("Media updated successfully");
        }
        setIsUpdating(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) return;
        const res = await deleteMedia(id);
        if (res.success) {
            setMedia(media.filter(m => m.id !== id));
            setSelectedItem(null);
        }
    };

    const filteredMedia = media.filter(m =>
        m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.altText && m.altText.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatBytes = (bytes: number) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        {isUploading ? "Uploading..." : "Upload New"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
                {/* Media Grid */}
                <div className="lg:col-span-8 bg-card border border-border rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            Library Items ({filteredMedia.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/10">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                <ImageIcon className="w-16 h-16 opacity-10" />
                                <p className="text-sm font-bold tracking-widest uppercase">No media found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={cn(
                                            "relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300",
                                            selectedItem?.id === item.id
                                                ? "ring-4 ring-primary ring-offset-4 ring-offset-background"
                                                : "hover:scale-[0.98]"
                                        )}
                                    >
                                        <Image
                                            src={item.url}
                                            alt={item.altText || item.filename}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] text-white font-bold uppercase tracking-widest px-2 py-1 bg-black/60 rounded-lg">
                                                Select
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Sidebar */}
                <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
                    <AnimatePresence mode="wait">
                        {selectedItem ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-card border border-border rounded-[32px] overflow-hidden shadow-xl"
                            >
                                <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                                    <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" />
                                        Attachment Details
                                    </h3>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative aspect-video w-full bg-muted/50 overflow-hidden">
                                    <Image
                                        src={selectedItem.url}
                                        alt={selectedItem.filename}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button className="p-2 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-primary transition-all shadow-lg">
                                            <Crop className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</span>
                                            <p className="text-foreground">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> Size</span>
                                            <p className="text-foreground">{formatBytes(selectedItem.size)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Type</span>
                                            <p className="text-foreground">{selectedItem.mimeType?.split('/')[1].toUpperCase() || 'IMG'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5"><Type className="w-3 h-3" /> Dimensions</span>
                                            <p className="text-foreground">{selectedItem.width || '?'} × {selectedItem.height || '?'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Alt Text (SEO)</label>
                                            <input
                                                value={selectedItem.altText || ""}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, altText: e.target.value })}
                                                className="w-full bg-muted/30 border border-border p-3 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="Describe the image content..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Caption</label>
                                            <textarea
                                                value={selectedItem.caption || ""}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, caption: e.target.value })}
                                                className="w-full bg-muted/30 border border-border p-3 rounded-xl text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                                placeholder="Public caption displayed below image..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Description</label>
                                            <textarea
                                                value={selectedItem.description || ""}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                                                className="w-full bg-muted/30 border border-border p-3 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                                placeholder="Internal media description..."
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdate()}
                                                disabled={isUpdating}
                                                className="flex-1 bg-foreground text-background py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {isUpdating ? "Saving..." : "Save Metadata"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(selectedItem.id)}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Public URL</p>
                                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
                                            <input
                                                readOnly
                                                value={window.location.origin + selectedItem.url}
                                                className="bg-transparent border-none text-[10px] flex-1 font-mono focus:ring-0"
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(window.location.origin + selectedItem.url)}
                                                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-card/50 border border-border border-dashed rounded-[32px] p-12 text-center h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center border border-border">
                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-xs uppercase tracking-widest">No Selection</p>
                                    <p className="text-xs">Select an item from the library to view details and edit SEO metadata.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
