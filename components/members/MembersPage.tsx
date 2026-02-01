"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { User } from '@/lib/types';
import Link from "next/link";
import { User as UserIcon, Calendar, MapPin, ExternalLink } from "lucide-react";

import UserAvatar from "@/components/ui/UserAvatar";

interface MembersPageProps {
    users: User[];
    currentUser: any;
    lang: string;
    dict: any;
}

export default function MembersPage({ users, currentUser, lang, dict }: MembersPageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sidebar - Fixed Left */}
            <Sidebar lang={lang} dict={dict} user={currentUser} />

            {/* Main Content Area */}
            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={currentUser} />

                <main className="p-6 md:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">{dict.Sidebar?.members || "Members"}</h1>
                            <p className="text-muted-foreground">Discover other creators in the community.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {users.map((user) => (
                            <Link href={`/${lang}/profile/${user.username || user.id}`} key={user.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 flex flex-col">
                                <div className="h-24 bg-gradient-to-r from-primary/20 to-purple-500/10 group-hover:from-primary/30 group-hover:to-purple-500/20 transition-colors" />
                                <div className="px-6 -mt-10 flex items-end justify-between">
                                    <div className="relative">
                                        <UserAvatar
                                            src={user.avatar}
                                            alt={user.name}
                                            size={80}
                                            className="ring-4 ring-card shadow-xl group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <button className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full transition-colors mb-2">
                                        Follow
                                    </button>
                                </div>

                                <div className="p-6 pt-3 flex-1 flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                                        {user.role && <p className="text-xs text-primary/80 uppercase font-semibold tracking-wider mt-0.5">{user.role}</p>}
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {user.bio || "Digital creator exploring AI art and prompts."}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Joined {new Date(user.createdAt).getFullYear()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{user.promptsCount || 0}</span> Prompts
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                </main>
            </div>
        </div>
    );
}
