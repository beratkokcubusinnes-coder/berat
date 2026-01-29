"use client";

import Image from "next/image";
import Link from "next/link";
import { FileCode2, Eye, Heart, Terminal } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

export function ScriptCard({ script, lang, dict }: { script: any; lang: string; dict?: any }) {
    const mainImage = script.image || script.ogImage || "/images/placeholder-code.png";
    const username = script.author?.username || "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300"
        >
            <div className="relative h-48 w-full bg-muted/20">
                <Image
                    src={mainImage}
                    alt={script.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-blue-400" />
                        {dict?.Common?.script || "Script"}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <Link href={getHref(`/scripts/${script.categoryData?.slug || 'general'}/${script.slug}`, lang)} className="block mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{script.title}</h3>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{script.description}</p>

                <div className="flex items-center justify-between text-muted-foreground text-[10px] mt-auto">
                    <Link href={getHref(`/profile/${username}`, lang)} className="flex items-center gap-2 group/author">
                        <UserAvatar src={script.author?.avatar} alt={script.author?.name} size={18} />
                        <span className="group-hover/author:text-primary transition-colors">@{username}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{script.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{script.likes || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
