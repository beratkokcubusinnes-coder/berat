"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyPromptProps {
    prompt: string;
    title?: string;
}

export function CopyPrompt({ prompt, title = "Prompt Command" }: CopyPromptProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-[#0d0d12] border border-border/50 rounded-2xl overflow-hidden group">
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        copied
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    )}
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            Copy Prompt
                        </>
                    )}
                </button>
            </div>
            <div className="p-5">
                <p className="text-sm font-mono text-foreground/90 leading-relaxed break-words whitespace-pre-wrap select-all">
                    {prompt}
                </p>
            </div>
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center gap-3">
                <span className="text-[9px] font-medium text-muted-foreground/40 italic">Click the content or button to copy to clipboard</span>
            </div>
        </div>
    );
}
