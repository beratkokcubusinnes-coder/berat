"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, Clock } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

export function BlogCard({ post, lang, dict }: { post: any; lang: string; dict?: any }) {
    const mainImage = post.image || post.featuredImage || post.ogImage || "/images/placeholder-blog.png";
    const username = post.author?.username || "admin";

    // Formatting date
    const date = new Date(post.createdAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col"
        >
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={mainImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {post.category || dict?.Common?.article || "Article"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-white/80 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{dict?.Common?.readTime?.replace('{min}', '5') || "5 min read"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <Link href={getHref(`/blog/${post.categoryData?.slug || 'general'}/${post.slug}`, lang)} className="block mb-3">
                    <h3 className="font-bold text-lg text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {post.excerpt || post.description}
                </p>

                <div className="flex items-center justify-between border-t border-border pt-4">
                    <Link href={getHref(`/profile/${username}`, lang)} className="flex items-center gap-2 group/author">
                        <UserAvatar src={post.author?.avatar} alt={post.author?.name} size={24} />
                        <span className="text-xs font-bold text-foreground group-hover/author:text-primary transition-colors">
                            {post.author?.name}
                        </span>
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
