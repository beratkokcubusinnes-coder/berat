"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PromptDisplay from "@/components/community/PromptDisplay";
import UserAvatar from "@/components/ui/UserAvatar";
import {
    MessageSquare, Heart, Share2, MoreHorizontal, Plus, Search,
    Hash, User as UserIcon, TrendingUp, Filter, Send, Code, Image as ImageIcon, X
} from "lucide-react";

interface Thread {
    id: string;
    slug: string;
    title: string;
    content: string;
    prompt?: string;
    mediaUrls?: string;
    category: string;
    createdAt: string;
    author: {
        name: string;
        username: string;
        avatar: string | null;
    };
    _count: {
        likes: number;
        comments: number;
    };
    isLiked?: boolean;
}

export default function CommunityClient({ lang, user }: { lang: string, user?: any }) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // New Post State
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [newMediaUrl, setNewMediaUrl] = useState("");
    const [showPromptInput, setShowPromptInput] = useState(false);
    const [showMediaInput, setShowMediaInput] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(false);

    const router = useRouter();

    // Stats State
    const [stats, setStats] = useState<{
        recentThreads: any[];
        recentComments: any[];
        activeUsers: any[];
    }>({ recentThreads: [], recentComments: [], activeUsers: [] });

    useEffect(() => {
        fetchThreads();
        fetchStats();
    }, [activeCategory]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/community/stats");
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchThreads = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/community/threads?category=${activeCategory}`);
            const data = await res.json();
            setThreads(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newTitle || !newContent) return;
        setIsPosting(true);
        try {
            const res = await fetch("/api/community/threads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category: activeCategory === "All" ? "General" : activeCategory,
                    prompt: newPrompt || null,
                    mediaUrls: newMediaUrl ? JSON.stringify([newMediaUrl]) : null
                })
            });
            if (res.ok) {
                setNewTitle("");
                setNewContent("");
                setNewPrompt("");
                setNewMediaUrl("");
                setShowPromptInput(false);
                setShowMediaInput(false);
                setIsInputExpanded(false);
                fetchThreads();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || data.message || "Failed to create post"}`);
            }
        } catch (e) {
            console.error("Post error:", e);
            alert("An error occurred while posting. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (id: string) => {
        try {
            await fetch(`/api/community/threads/${id}/like`, { method: "POST" });
            fetchThreads();
        } catch (e) { }
    };

    const navigateToThread = (slug: string) => {
        router.push(`/${lang}/community/${slug}`);
    };

    const categories = [
        { id: "All", label: "All Topics" },
        { id: "General", label: "General Discussion" },
        { id: "Prompts", label: "Prompt Engineering" },
        { id: "Showcase", label: "Showcase" },
        { id: "Help", label: "Help & Support" },
        { id: "Ideas", label: "Feature Requests" },
    ];

    return (
        <div className="flex flex-col h-full bg-background theme-transition">
            {/* Header / Title Area */}
            <div className="px-6 md:px-8 pt-6 pb-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                    Community
                </h1>
                <p className="text-muted-foreground text-sm">Join the discussion, share prompts, and connect with other creators.</p>

                {/* Horizontal Category Filters */}
                <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-border/80"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-hidden mt-2">
                <div className="h-full flex gap-8">
                    {/* MAIN FEED */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-20 scroll-smooth">
                        <div className="space-y-8">

                            {/* Create Post Input */}
                            <div className={`bg-card border border-border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${isInputExpanded ? "ring-2 ring-primary/20" : ""}`}>
                                <div className="p-4 flex gap-4">
                                    <UserAvatar src={user?.avatar} alt="You" size={40} className="shadow-inner" />
                                    <div className="flex-1">
                                        {!isInputExpanded ? (
                                            <div
                                                onClick={() => setIsInputExpanded(true)}
                                                className="w-full py-2.5 px-4 bg-muted/30 rounded-full text-muted-foreground text-sm cursor-text hover:bg-muted/50 transition-colors flex items-center justify-between"
                                            >
                                                Start a new thread...
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md pb-0.5">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <input
                                                    value={newTitle}
                                                    onChange={e => setNewTitle(e.target.value)}
                                                    placeholder="Thread Title"
                                                    className="w-full bg-transparent text-lg font-bold placeholder:text-muted-foreground/50 border-none outline-none p-0 text-foreground"
                                                    autoFocus
                                                />
                                                <textarea
                                                    value={newContent}
                                                    onChange={e => setNewContent(e.target.value)}
                                                    placeholder="What's on your mind? Share prompts, ideas, or questions..."
                                                    className="w-full bg-transparent min-h-[80px] resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50 border-none outline-none p-0 text-foreground"
                                                />

                                                {/* Optional Inputs */}
                                                {showPromptInput && (
                                                    <div className="relative animate-in fade-in slide-in-from-top-1">
                                                        <textarea
                                                            value={newPrompt}
                                                            onChange={e => setNewPrompt(e.target.value)}
                                                            placeholder="Enter your prompt command here..."
                                                            className="w-full bg-[#0d0d12] border border-border/50 rounded-xl p-3 text-xs font-mono text-gray-300 min-h-[100px] resize-none focus:ring-1 focus:ring-blue-500/50 outline-none"
                                                        />
                                                        <button onClick={() => setShowPromptInput(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {showMediaInput && (
                                                    <div className="relative flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                        <input
                                                            value={newMediaUrl}
                                                            onChange={e => setNewMediaUrl(e.target.value)}
                                                            placeholder="Paste image URL here (https://...)"
                                                            className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20 text-foreground"
                                                        />
                                                        <button onClick={() => setShowMediaInput(false)} className="p-2 text-muted-foreground hover:text-red-500">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setShowPromptInput(!showPromptInput)}
                                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showPromptInput ? "bg-blue-500/10 text-blue-400" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
                                                        >
                                                            <Code className="w-3 h-3" /> Add Prompt
                                                        </button>
                                                        <button
                                                            onClick={() => setShowMediaInput(!showMediaInput)}
                                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showMediaInput ? "bg-purple-500/10 text-purple-400" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
                                                        >
                                                            <ImageIcon className="w-3 h-3" /> Add Image
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                                            onClick={() => setIsInputExpanded(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handlePost}
                                                            disabled={isPosting || !newTitle || !newContent}
                                                            className="px-6 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                                        >
                                                            {isPosting ? "Posting..." : <><Send className="w-3 h-3" /> Post</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Thread List */}
                            <div className="space-y-6">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                                            <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
                                            <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                            <div className="h-4 w-2/3 bg-muted rounded"></div>
                                        </div>
                                    ))
                                ) : threads.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>No threads found in this category.</p>
                                    </div>
                                ) : (
                                    threads.map(thread => (
                                        <div
                                            key={thread.id}
                                            onClick={() => navigateToThread(thread.slug)}
                                            className="group bg-card hover:bg-muted/5 border border-border hover:border-border/80 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar
                                                        src={thread.author.avatar}
                                                        alt={thread.author.name}
                                                        size={40}
                                                        className="ring-2 ring-background object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground">{thread.author.name || thread.author.username}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(thread.createdAt).toLocaleDateString()} • {thread.category}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="pl-[52px]">
                                                <h3 className="text-lg font-bold mb-2 text-foreground leading-tight">{thread.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4 line-clamp-4">
                                                    {thread.content}
                                                </p>

                                                {/* Prompt Display */}
                                                {thread.prompt && (
                                                    <div onClick={e => e.stopPropagation()}>
                                                        <PromptDisplay prompt={thread.prompt} />
                                                    </div>
                                                )}

                                                {/* Image Display */}
                                                {thread.mediaUrls && (() => {
                                                    try {
                                                        const urls = JSON.parse(thread.mediaUrls);
                                                        // Handle both single string (legacy/simple) and array
                                                        const urlList = Array.isArray(urls) ? urls : [urls];

                                                        if (urlList.length > 0 && urlList[0]) {
                                                            return (
                                                                <div className="mt-4 mb-4 rounded-xl overflow-hidden border border-border/50 bg-black/20">
                                                                    <img
                                                                        src={urlList[0]}
                                                                        alt="Attachment"
                                                                        className="w-full max-h-96 object-contain"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    } catch (e) {
                                                        // Fallback if it's a raw string url
                                                        if (thread.mediaUrls.startsWith('http')) {
                                                            return (
                                                                <div className="mt-4 mb-4 rounded-xl overflow-hidden border border-border/50 bg-black/20">
                                                                    <img
                                                                        src={thread.mediaUrls}
                                                                        alt="Attachment"
                                                                        className="w-full max-h-96 object-contain"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    }
                                                    return null;
                                                })()}

                                                <div className="flex items-center gap-4 border-t border-border/50 pt-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleLike(thread.id); }}
                                                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-pink-500 transition-colors group/like"
                                                    >
                                                        <div className="p-1.5 rounded-full group-hover/like:bg-pink-500/10 transition-colors">
                                                            <Heart className="w-4 h-4" />
                                                        </div>
                                                        {thread._count.likes} Likes
                                                    </button>
                                                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-blue-500 transition-colors group/comment">
                                                        <div className="p-1.5 rounded-full group-hover/comment:bg-blue-500/10 transition-colors">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </div>
                                                        {thread._count.comments} Comments
                                                    </button>

                                                    <button onClick={(e) => e.stopPropagation()} className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                        <Share2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Right Sidebar - Widgets */}
                    <div className="w-80 hidden xl:flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700 sticky top-0 h-fit pb-10 mt-2 pt-1 pr-6 md:pr-8">

                        {/* 1. Active Members Widget */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-wider">
                                <UserIcon className="w-3.5 h-3.5" /> Active Members
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {stats.activeUsers.length > 0 ? stats.activeUsers.map((user: any) => (
                                    <div key={user.id} className="group relative flex flex-col items-center">
                                        <div className="relative">
                                            <UserAvatar
                                                src={user.avatar}
                                                alt={user.name}
                                                size={40}
                                                className="ring-2 ring-background group-hover:ring-primary/50 transition-all"
                                            />
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center group-hover:text-foreground transition-colors">
                                            {user.username}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground col-span-4 italic">No active members recently.</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Recent Threads Widget */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-wider">
                                <TrendingUp className="w-3.5 h-3.5" /> Recent Threads
                            </h3>
                            <div className="space-y-4">
                                {stats.recentThreads.length > 0 ? stats.recentThreads.map((thread: any) => (
                                    <div
                                        key={thread.id}
                                        onClick={() => navigateToThread(thread.slug)}
                                        className="group cursor-pointer"
                                    >
                                        <h4 className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                                            {thread.title}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {new Date(thread.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic">No threads yet.</p>
                                )}
                            </div>
                        </div>

                        {/* 3. Recent Comments Widget */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-wider">
                                <MessageSquare className="w-3.5 h-3.5" /> Recent Comments
                            </h3>
                            <div className="space-y-4">
                                {stats.recentComments.length > 0 ? stats.recentComments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <UserAvatar src={comment.author.avatar} alt={comment.author.name} size={28} className="shrink-0 self-start mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-muted-foreground leading-tight mb-0.5">
                                                <span className="font-bold text-foreground">{comment.author.username}</span> on <span className="text-primary hover:underline cursor-pointer" onClick={() => navigateToThread(comment.thread.slug)}>{comment.thread.title.slice(0, 15)}...</span>
                                            </p>
                                            <p className="text-xs text-foreground/80 line-clamp-2 italic border-l-2 border-border pl-2 my-1">
                                                "{comment.content}"
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic">No comments yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
