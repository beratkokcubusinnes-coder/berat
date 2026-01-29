"use client";

import Link from "next/link";
import { UserPlus, Sparkles, Users as UsersIcon } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { getHref } from "@/lib/i18n";

export function MemberCard({ member, lang, dict }: { member: any; lang: string; dict?: any }) {
    const promptCount = member._count?.prompts || 0;
    const followerCount = member._count?.followers || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-card border border-border rounded-3xl p-6 hover:border-primary/40 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />

            <div className="relative mb-4">
                <UserAvatar src={member.avatar} alt={member.name} size={90} className="ring-4 ring-background shadow-xl group-hover:scale-105 transition-transform" />
                {member.role === 'admin' && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black p-1 rounded-full shadow-lg">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            <Link href={getHref(`/profile/${member.username}`, lang)} className="mb-1">
                <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">{member.name || member.username}</h3>
                <p className="text-xs text-muted-foreground font-medium">@{member.username}</p>
            </Link>

            <div className="w-full grid grid-cols-2 gap-4 mt-6 mb-6">
                <div className="flex flex-col items-center p-2 rounded-2xl bg-muted/30">
                    <span className="text-sm font-black text-foreground">{promptCount}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{dict?.Common?.prompts || "Prompts"}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-2xl bg-muted/30">
                    <span className="text-sm font-black text-foreground">{followerCount}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{dict?.Common?.followers || "Followers"}</span>
                </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-foreground text-background text-xs font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-black/5">
                <UserPlus className="w-3.5 h-3.5" />
                {dict?.Common?.follow || "Follow"}
            </button>
        </motion.div>
    );
}
