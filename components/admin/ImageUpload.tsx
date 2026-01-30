"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    name: string;
    label: string;
    defaultValue?: string;
    className?: string;
    onPreviewChange?: (url: string) => void;
}

export function ImageUpload({ name, label, defaultValue, className, onPreviewChange }: ImageUploadProps) {
    const [preview, setPreview] = useState(defaultValue);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview if defaultValue changes (e.g. from server)
    useEffect(() => {
        if (defaultValue) setPreview(defaultValue);
    }, [defaultValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onPreviewChange?.(url);
        }
    };

    const handleClear = () => {
        setPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onPreviewChange?.("");
    };

    return (
        <div className={cn("space-y-3", className)}>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> {label}
            </label>

            <div className="relative group">
                {/* 
                   Hidden input carries the existing URL if no new file is chosen.
                */}
                <input
                    type="hidden"
                    name={name}
                    value={defaultValue || ""}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    name={`${name}File`}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "w-full bg-muted/30 border-2 border-dashed border-border rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 min-h-[200px]",
                        preview ? "border-solid p-0 bg-transparent" : "p-4"
                    )}
                >
                    {preview ? (
                        <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-black/5">
                            <img src={preview} alt="Upload preview" className="max-w-full max-h-[300px] object-contain rounded-lg" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">Change Image</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground py-10">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-sm">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="text-xs font-extrabold uppercase tracking-wider block mb-1">Upload Image</span>
                                <span className="text-[10px] opacity-60">Click to browse</span>
                            </div>
                        </div>
                    )}
                </div>

                {preview && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}
