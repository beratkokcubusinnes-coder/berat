"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { User as UserIcon, Calendar, MapPin, Edit3, Grid, Heart, Layers, MessageSquare, Camera } from "lucide-react";
import Image from "next/image";
import UserAvatar from "@/components/ui/UserAvatar";
import { MOCK_PROMPTS } from "@/lib/data";
import { PromptCard } from "@/components/ui/PromptCard";
import { ScriptCard } from "@/components/ui/ScriptCard";
import { HookCard } from "@/components/ui/HookCard";
import { BlogCard } from "@/components/ui/BlogCard";
import { followUser, unfollowUser, isFollowing as checkFollowing } from "@/actions/social";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProfilePageProps {
    user: {
        id: string;
        name: string;
        username: string;
        avatar?: string | null;
        coverImage?: string | null;
        bio?: string | null;
        location?: string | null;
        role?: string;
        createdAt?: Date;
        [key: string]: any;
    };
    lang: string;
    dict: any;
    isOwnProfile?: boolean;
    sessionUser?: any;
}

export default function ProfilePage({ user, lang, dict, isOwnProfile = false, sessionUser }: ProfilePageProps) {
    const [activeTab, setActiveTab] = useState("prompts");
    const [isFollowed, setIsFollowed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOwnProfile && sessionUser && user.id) {
            checkFollowing(user.id).then(setIsFollowed);
        }
    }, [user.id, isOwnProfile, sessionUser]);

    const handleFollowToggle = async () => {
        if (!sessionUser) return alert("Please login to follow creators");
        setLoading(true);
        if (isFollowed) {
            const res = await unfollowUser(user.id);
            if (res.success) setIsFollowed(false);
        } else {
            const res = await followUser(user.id);
            if (res.success) setIsFollowed(true);
        }
        setLoading(false);
    };

    const stats = [
        { label: dict.Sidebar?.prompts || "Prompts", value: user.promptsCount || 0, icon: Grid },
        { label: dict.Profile?.favorites || "Favorites", value: user.favoritesCount || 0, icon: Heart },
        { label: "Followers", value: user.followers || 0, icon: UserIcon },
        { label: "Following", value: user.following || 0, icon: UserIcon },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={sessionUser} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={sessionUser || (isOwnProfile ? user : undefined)} />

                <main className="p-6 md:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden bg-card border border-border h-64 md:h-80 group">
                            {user.coverImage ? (
                                <Image
                                    src={user.coverImage}
                                    alt="Cover"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-600/20 animate-gradient-x" />
                            )}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all text-white" />

                            {isOwnProfile && (
                                <Link
                                    href={`/${lang}/profile/edit`}
                                    className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/10 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 z-10"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    {dict.Profile?.changeCover || "Change Cover"}
                                </Link>
                            )}
                        </div>

                        <div className="absolute -bottom-10 left-6 md:left-10 flex items-end z-20">
                            <div className="relative group/avatar">
                                <UserAvatar
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-2xl bg-card"
                                />
                                {isOwnProfile && (
                                    <Link
                                        href={`/${lang}/profile/edit`}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all border-4 border-transparent"
                                        title={dict.Profile?.editProfile || "Edit Profile"}
                                    >
                                        <Camera className="w-8 h-8 text-white" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 flex flex-col md:flex-row md:items-start justify-between gap-6 px-2">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                {user.name}
                                {user.role === 'admin' && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20">Admin</span>}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location || "Earth, Milky Way"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{dict.Profile?.memberSince || "Member since"} {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <p className="max-w-xl text-sm text-muted-foreground/80 leading-relaxed pt-2">
                                {user.bio || "Digital artist and prompt engineer exploring the latent space. Sharing my journey through pixels and code."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {isOwnProfile ? (
                                <>
                                    <Link
                                        href={`/${lang}/profile/edit`}
                                        className="px-5 py-2.5 rounded-full bg-card hover:bg-muted/50 border border-border hover:border-foreground/20 text-foreground text-sm font-medium transition-all"
                                    >
                                        {dict.Profile?.editProfile || "Edit Profile"}
                                    </Link>
                                    <button className="p-2.5 rounded-full bg-card hover:bg-muted/50 border border-border hover:border-foreground/20 text-foreground transition-all">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={loading}
                                        className={cn(
                                            "px-8 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg",
                                            isFollowed
                                                ? "bg-muted text-foreground border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                                        )}
                                    >
                                        {loading ? "..." : (isFollowed ? "Unfollow" : "Follow")}
                                    </button>
                                    <button className="p-2.5 rounded-full bg-card hover:bg-muted/50 border border-border hover:border-foreground/20 text-foreground transition-all">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 hover:border-foreground/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="border-b border-border flex items-center gap-8 text-sm font-medium overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab("prompts")}
                                className={cn("pb-3 px-1 transition-all whitespace-nowrap", activeTab === "prompts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {dict.Sidebar?.prompts || "Prompts"} ({user.prompts?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("scripts")}
                                className={cn("pb-3 px-1 transition-all whitespace-nowrap", activeTab === "scripts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {dict.Sidebar?.scripts || "Scripts"} ({user.scripts?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("hooks")}
                                className={cn("pb-3 px-1 transition-all whitespace-nowrap", activeTab === "hooks" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {dict.Sidebar?.hooks || "Hooks"} ({user.hooks?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("blog")}
                                className={cn("pb-3 px-1 transition-all whitespace-nowrap", activeTab === "blog" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {dict.Sidebar?.blog || "Blog"} ({user.blogPosts?.length || 0})
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {activeTab === "prompts" && user.prompts?.map((prompt: any) => (
                                <PromptCard key={prompt.id} prompt={prompt} lang={lang} />
                            ))}
                            {activeTab === "scripts" && user.scripts?.map((script: any) => (
                                <ScriptCard key={script.id} script={script} lang={lang} />
                            ))}
                            {activeTab === "hooks" && user.hooks?.map((hook: any) => (
                                <HookCard key={hook.id} hook={hook} lang={lang} />
                            ))}
                            {activeTab === "blog" && user.blogPosts?.map((post: any) => (
                                <BlogCard key={post.id} post={post} lang={lang} />
                            ))}

                            {((activeTab === "prompts" && (!user.prompts || user.prompts.length === 0)) ||
                                (activeTab === "scripts" && (!user.scripts || user.scripts.length === 0)) ||
                                (activeTab === "hooks" && (!user.hooks || user.hooks.length === 0)) ||
                                (activeTab === "blog" && (!user.blogPosts || user.blogPosts.length === 0))) && (
                                    <div className="col-span-full py-20 text-center space-y-4">
                                        <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                        <div className="text-muted-foreground font-medium">No content found here.</div>
                                    </div>
                                )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
