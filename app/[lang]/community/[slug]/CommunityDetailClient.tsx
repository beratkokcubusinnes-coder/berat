"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, MessageSquare, Heart, Share2, MoreHorizontal, Send,
    User as UserIcon, Calendar, Loader2
} from "lucide-react";
import PromptDisplay from "@/components/community/PromptDisplay";
import UserAvatar from "@/components/ui/UserAvatar";
import { BlockRenderer } from "@/components/ui/BlockRenderer";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        name: string;
        username: string;
        avatar: string | null;
    };
    likes: number;
}

interface ThreadDetail {
    id: string;
    slug: string;
    title: string;
    content: string;
    prompt?: string;
    mediaUrls?: string;
    category: string;
    createdAt: string;
    views: number;
    author: {
        name: string;
        username: string;
        avatar: string | null;
    };
    _count: {
        likes: number;
        comments: number;
    };
}

export default function CommunityDetailClient({ lang, slug, user }: { lang: string, slug: string, user?: any }) {
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [relatedThreads, setRelatedThreads] = useState<any[]>([]); // New state
    const [stats, setStats] = useState<any>(null); // New state for sidebar
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [slug]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // First fetch thread details to get category
            const threadRes = await fetch(`/api/community/threads/${slug}`);
            if (!threadRes.ok) {
                setIsLoading(false);
                return;
            }
            const threadData = await threadRes.json();
            setThread(threadData);

            // Then fetch comments, related threads, and stats in parallel
            const [commentsRes, relatedRes, statsRes] = await Promise.all([
                fetch(`/api/community/threads/${slug}/comments`),
                fetch(`/api/community/threads?category=${threadData.category}&take=4`), // Basic related logic
                fetch("/api/community/stats")
            ]);

            if (commentsRes.ok) setComments(await commentsRes.json());
            if (relatedRes.ok) {
                const related = await relatedRes.json();
                // Filter out current thread
                setRelatedThreads(related.filter((t: any) => t.id !== threadData.id).slice(0, 3));
            }
            if (statsRes.ok) setStats(await statsRes.json());

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/community/threads/${slug}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([...comments, comment]);
                setNewComment("");
                if (thread) {
                    setThread({
                        ...thread,
                        _count: { ...thread._count, comments: thread._count.comments + 1 }
                    });
                }
            }
        } catch (error) {
            alert("Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (!thread) return;
        try {
            const res = await fetch(`/api/community/threads/${slug}/like`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setThread(prev => prev ? ({
                    ...prev,
                    _count: {
                        ...prev._count,
                        likes: data.liked ? prev._count.likes + 1 : prev._count.likes - 1
                    }
                }) : null);
            }
        } catch (e) { }
    };

    const navigateToThread = (s: string) => {
        router.push(`/${lang}/community/${s}`);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!thread) return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <h2 className="text-xl font-bold">Thread not found</h2>
            <Link href={`/${lang}/community`} className="mt-4 text-primary hover:underline">Return to Community</Link>
        </div>
    );

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 bg-background">
            {/* Header / Nav */}
            <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${lang}/community`}
                        className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{thread.category}</span>
                        <h1 className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">{thread.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors md:hidden">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Share2 className="w-3 h-3" /> Share
                    </button>
                </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-[1600px] mx-auto flex items-start gap-8 p-6 md:p-8">

                    {/* LEFT COLUMN: Main Thread & Comments */}
                    <div className="flex-1 min-w-0 space-y-8 pb-20">

                        {/* Thread Card */}
                        <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {/* Author Info */}
                            <div className="flex items-center justify-between mb-8 relative">
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        src={thread.author.avatar}
                                        alt={thread.author.name}
                                        size={56}
                                        className="ring-4 ring-background shadow-md object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{thread.author.name || thread.author.username}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                            {new Date(thread.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                            {thread.views} views
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* Action buttons could go here */}
                                </div>
                            </div>

                            {/* Title & Content */}
                            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-8 leading-[1.1] tracking-tight">{thread.title}</h1>

                            <div className="relative">
                                <BlockRenderer content={thread.content} className="text-base md:text-lg leading-relaxed text-foreground/90" />

                                {thread.prompt && (
                                    <div className="my-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Attached Prompt Metadata</h3>
                                        </div>
                                        <PromptDisplay prompt={thread.prompt} />
                                    </div>
                                )}

                                {thread.mediaUrls && !thread.content.startsWith('[{"id"') && (() => {
                                    try {
                                        const urls = JSON.parse(thread.mediaUrls);
                                        const urlList = Array.isArray(urls) ? urls : [urls];
                                        if (urlList.length > 0 && urlList[0]) {
                                            return (
                                                <div className="my-10 rounded-3xl overflow-hidden border border-border/50 bg-black/40 shadow-2xl group cursor-zoom-in">
                                                    <img
                                                        src={urlList[0]}
                                                        alt="Attachment"
                                                        className="w-full h-auto object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.01]"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )
                                        }
                                    } catch (e) {
                                        if (thread.mediaUrls.startsWith('http')) {
                                            return (
                                                <div className="my-10 rounded-3xl overflow-hidden border border-border/50 bg-black/40 shadow-2xl group cursor-zoom-in">
                                                    <img
                                                        src={thread.mediaUrls}
                                                        alt="Attachment"
                                                        className="w-full h-auto object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.01]"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )
                                        }
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Interaction Bar */}
                            <div className="flex items-center justify-between pt-8 border-t border-border/40">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-500/5 text-pink-500 hover:bg-pink-500/10 border border-pink-500/10 transition-all font-black text-xs shadow-sm"
                                    >
                                        <Heart className={`w-4 h-4 ${thread.id ? 'fill-current' : ''}`} />
                                        {thread._count.likes} Likes
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10 transition-all font-black text-xs shadow-sm">
                                        <MessageSquare className="w-4 h-4 fill-current" />
                                        {thread._count.comments} Comments
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Discussion Area */}
                        <div className="bg-card/30 border border-border/40 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                    Discussion
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{comments.length}</span>
                                </h3>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sort by: Newest</div>
                            </div>

                            {/* Comment Input */}
                            <form onSubmit={handleCommentSubmit} className="mb-12 group">
                                <div className="flex gap-5">
                                    <UserAvatar src={user?.avatar} alt="You" size={48} className="shadow-xl ring-2 ring-primary/20 shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="relative">
                                            <textarea
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                placeholder="Join the conversation..."
                                                className="w-full bg-black/20 border border-border/50 rounded-3xl p-5 text-sm min-h-[120px] resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                                            />
                                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting || !newComment.trim()}
                                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-95"
                                                >
                                                    Post Reply <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Comment List */}
                            <div className="space-y-10">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="group relative flex gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <UserAvatar
                                                src={comment.author.avatar}
                                                alt={comment.author.name}
                                                size={48}
                                                className="ring-4 ring-background shadow-lg shrink-0 object-cover"
                                            />
                                            <div className="w-0.5 flex-1 bg-gradient-to-b from-border/50 to-transparent group-last:hidden" />
                                        </div>
                                        <div className="flex-1 space-y-3 pb-8 group-last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-black text-foreground tracking-tight">{comment.author.name || comment.author.username}</p>
                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <button className="p-1.5 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="bg-card/40 border border-border/40 rounded-[1.25rem] rounded-tl-none p-5 hover:border-border/80 transition-all shadow-sm">
                                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">{comment.content}</p>
                                            </div>
                                            <div className="flex items-center gap-6 mt-3 ml-1">
                                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-pink-500 transition-colors">
                                                    <Heart className="w-3.5 h-3.5" /> Like
                                                </button>
                                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="py-20 text-center space-y-3">
                                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground">No comments yet</p>
                                        <p className="text-xs text-muted-foreground/50">Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related / "More like this" Section (Bottom) */}
                        {relatedThreads.length > 0 && (
                            <div className="pt-8 border-t border-border/40">
                                <h3 className="text-lg font-bold mb-6 text-muted-foreground uppercase tracking-wider text-xs">More in {thread.category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedThreads.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => navigateToThread(t.slug)}
                                            className="bg-card/30 hover:bg-card/50 border border-border/40 rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30"
                                        >
                                            <h4 className="font-bold text-foreground mb-2 line-clamp-1">{t.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{t.content}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {/* Re-using data if available or just placeholders */}
                                                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Sidebar (Desktop Only) */}
                    <div className="w-80 hidden xl:flex flex-col gap-6 sticky top-24 h-fit">
                        {/* Author Card */}
                        <div className="bg-card/30 border border-border/40 rounded-2xl p-5">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4">About Author</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <UserAvatar
                                    src={thread.author.avatar}
                                    alt={thread.author.name}
                                    size={48}
                                    className="ring-2 ring-background object-cover"
                                />
                                <div>
                                    <p className="font-bold text-sm">{thread.author.name}</p>
                                    <p className="text-xs text-muted-foreground">@{thread.author.username}</p>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors">
                                View Profile
                            </button>
                        </div>

                        {/* Community Stats / Active Members (Reused Logic) */}
                        {stats && (
                            <div className="bg-card/30 border border-border/40 rounded-2xl p-5">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4">Active Now</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {stats.activeUsers?.slice(0, 8).map((u: any) => (
                                        <div key={u.id} className="relative group cursor-pointer" title={u.username}>
                                            <UserAvatar
                                                src={u.avatar}
                                                alt={u.name}
                                                size={36}
                                                className="hover:ring-2 hover:ring-primary transition-all aspect-square"
                                            />
                                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-background rounded-full"></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* More Interactive Elements can go here */}
                        <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/10 rounded-2xl p-5 text-center">
                            <h3 className="font-bold text-sm mb-2">Want to share?</h3>
                            <p className="text-xs text-muted-foreground mb-4">Create your own thread and join the conversation.</p>
                            <Link href={`/${lang}/community`} className="block w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                Create Thread
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
