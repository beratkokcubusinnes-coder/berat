"use client";

import Image from "next/image";
import Link from "next/link";
import { Wrench, Eye, Heart, ExternalLink } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

export function ToolCard({ tool, lang, dict }: { tool: any; lang: string; dict?: any }) {
    const images = Array.isArray(tool.images) ? tool.images : (tool.images?.split(',') || []);
    const mainImage = images[0] || "/images/placeholder-tools.png";
    const username = tool.author?.username || "user";

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300"
        >
            <div className="relative h-48 w-full bg-muted/20">
                <Image
                    src={mainImage}
                    alt={tool.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-orange-400" />
                        {dict?.Common?.tool || "Tool"}
                    </span>
                </div>

                {tool.url && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary text-white rounded-lg shadow-lg">
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}
            </div>

            <div className="p-4">
                <Link href={getHref(`/tools/${tool.categoryData?.slug || tool.category || 'all'}/${tool.slug || tool.id}`, lang)} className="block mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{tool.title}</h3>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{tool.description}</p>

                <div className="flex items-center justify-between text-muted-foreground text-[10px] mt-auto">
                    <Link href={getHref(`/profile/${username}`, lang)} className="flex items-center gap-2 group/author">
                        <UserAvatar src={tool.author?.avatar} alt={tool.author?.name} size={18} />
                        <span className="group-hover/author:text-primary transition-colors">@{username}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{tool.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{tool.likes || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
