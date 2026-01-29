"use client";

import { useState } from "react";
import { Copy, Check, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface PromptDisplayProps {
    prompt: string;
}

export default function PromptDisplay({ prompt }: PromptDisplayProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Show roughly 300 characters or 3-4 lines initially
    const shouldTruncate = prompt.length > 300;
    const displayContent = isExpanded ? prompt : prompt.slice(0, 300) + (shouldTruncate ? "..." : "");

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-border/50 bg-[#0d0d12] shadow-lg ring-1 ring-white/5">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase font-mono">
                        Prompt Command
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-medium text-muted-foreground hover:text-white transition-colors"
                >
                    {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? "Copied" : "Copy Prompt"}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 relative group">
                <code className="block font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {shouldTruncate && !isExpanded ? (
                        <>
                            {prompt.slice(0, 300)}
                            <span className="opacity-50">...</span>
                        </>
                    ) : prompt}
                </code>

                {/* Expand/Collapse Overlay if truncated */}
                {shouldTruncate && !isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0d12] to-transparent flex items-end justify-center pb-2">
                    </div>
                )}
            </div>

            {/* Footer / Toggle */}
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 border-t border-white/5"
                >
                    {isExpanded ? (
                        <>Collapse <ChevronUp className="w-3 h-3" /></>
                    ) : (
                        <>Expand Full Prompt <ChevronDown className="w-3 h-3" /></>
                    )}
                </button>
            )}
        </div>
    );
}
