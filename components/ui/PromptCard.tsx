"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, MoreHorizontal, CheckCircle2 } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { type Prompt } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

interface PromptCardProps {
    prompt: any; // Using any to handle prisma includes flexibly
    lang: string;
    dict?: any;
}

export function PromptCard({ prompt, lang, dict }: PromptCardProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateSliderPosition = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
        // Handle initial click position
        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        updateSliderPosition(clientX);
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent text selection while dragging
            updateSliderPosition(e.clientX);
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            updateSliderPosition(e.touches[0].clientX);
        };

        const handleGlobalTouchEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('touchmove', handleGlobalTouchMove);
            window.addEventListener('touchend', handleGlobalTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchmove', handleGlobalTouchMove);
            window.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, [isDragging]);

    const images = {
        before: prompt.beforeImage || prompt.image || (typeof prompt.images === 'string' ? prompt.images.split(',')[0] : ''),
        after: prompt.afterImage || prompt.image || (typeof prompt.images === 'string' ? (prompt.images.split(',')[1] || prompt.images.split(',')[0]) : '')
    };

    const username = (prompt.author as any).username;
    const views = (prompt as any).views || (prompt as any).metrics?.views || 0;
    const likes = (prompt as any).likes || (prompt as any).metrics?.likes || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300"
        >
            <Link href={getHref(`/prompt/${prompt.categoryData?.slug || 'general'}/${prompt.slug}`, lang)} className="absolute inset-x-0 bottom-0 top-[320px] z-20 cursor-pointer" />

            {/* Header/Tags overlay could go here */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    {prompt.model}
                </span>
            </div>

            {/* Image Comparison Area */}
            <div
                ref={containerRef}
                className="relative h-[320px] w-full cursor-col-resize select-none bg-muted/20 z-10"
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Background Image (Right side - 'After') */}
                <Image
                    src={images.after}
                    alt={prompt.title}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    draggable={false}
                />

                {/* Foreground Image (Left side - 'Before') - Clipped */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <Image
                        src={images.before}
                        alt={prompt.title}
                        fill
                        className="object-cover pointer-events-none"
                        draggable={false}
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-black">
                        <CodeIcon />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground truncate pr-2 group-hover:text-primary transition-colors">{prompt.title}</h3>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-xs mt-3">
                    <Link href={getHref(`/profile/${username}`, lang)} className="flex items-center gap-2 group/author z-30">
                        <UserAvatar
                            src={prompt.author.avatar}
                            alt={prompt.author.name}
                            size={20}
                            className="border border-border/10 ring-0"
                        />
                        <span className="group-hover/author:text-primary transition-colors">@{username}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 hover:text-foreground/80 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{views}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{likes}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CodeIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 6 21 12 15 18" />
            <polyline points="9 6 3 12 9 18" />
        </svg>
    )
}
