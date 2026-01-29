"use client";

import Link from "next/link";
import { MessageCircle, Heart, Eye, ArrowUpCircle } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

export function CommunityCard({ thread, lang, dict }: { thread: any; lang: string; dict?: any }) {
    const username = thread.author?.username || "user";
    const commentCount = thread._count?.comments || 0;
    const likeCount = thread._count?.likes || 0;
    const views = thread.views || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between">
                <Link href={getHref(`/profile/${username}`, lang)} className="flex items-center gap-3">
                    <UserAvatar src={thread.author?.avatar} alt={thread.author?.name} size={36} />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">@{username}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                            {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </Link>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageCircle className="w-4 h-4" />
                </div>
            </div>

            <Link href={getHref(`/community/${thread.slug || thread.id}`, lang)} className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                    {thread.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {thread.content?.substring(0, 150)}...
                </p>
            </Link>

            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                        <Heart className="w-4 h-4" />
                        <span>{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span>{commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{views}</span>
                    </div>
                </div>

                <Link href={getHref(`/community/${thread.slug || thread.id}`, lang)} className="text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform">
                    {dict?.Common?.viewPost || "View Post →"}
                </Link>
            </div>
        </motion.div>
    );
}
