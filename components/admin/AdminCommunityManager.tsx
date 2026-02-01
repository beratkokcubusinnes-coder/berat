"use client";

import { useState } from "react";
import { Trash2, MessageCircle, MessageSquare, ExternalLink, Calendar, User, Search, Filter, PenTool } from "lucide-react";
import { deleteAdminContent } from "@/actions/admin-content";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface AdminCommunityManagerProps {
    threads: any[];
    comments: any[];
    lang: string;
    dict: any;
}

export function AdminCommunityManager({ threads, comments, lang, dict }: AdminCommunityManagerProps) {
    const [activeTab, setActiveTab] = useState<'threads' | 'comments'>('threads');
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleDelete = async (id: string, type: 'thread' | 'comment') => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            const res = await deleteAdminContent(id, type);
            if (res.success) {
                router.refresh();
            } else {
                alert("Failed to delete item");
            }
        }
    };

    const filteredThreads = threads.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredComments = comments.filter(c =>
        c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('threads')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            activeTab === 'threads'
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Threads ({threads.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            activeTab === 'comments'
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Comments ({comments.length})
                    </button>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest text-[rgb(120,120,120)]">
                                <th className="px-8 py-5">{activeTab === 'threads' ? 'Thread' : 'Comment'}</th>
                                <th className="px-8 py-5">Author</th>
                                <th className="px-8 py-5">{activeTab === 'threads' ? 'Stats' : 'On Thread'}</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {activeTab === 'threads' ? (
                                filteredThreads.map((thread) => (
                                    <tr key={thread.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground leading-tight">{thread.title}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium mt-1 line-clamp-1 max-w-[400px]">
                                                    {thread.content.substring(0, 100)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    src={thread.author?.avatar}
                                                    alt={thread.author?.name}
                                                    size={32}
                                                />
                                                <span className="text-xs font-bold text-foreground/80">{thread.author?.name || "Guest"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5" title="Comments">
                                                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground">{thread._count.comments}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Views">
                                                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground">{thread.views}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold">
                                                    {new Date(thread.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(thread.id, 'thread')}
                                                    className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/${lang}/admin/community/edit/${thread.id}`}
                                                    className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary"
                                                    title="Edit"
                                                >
                                                    <PenTool className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/${lang}/community/${thread.slug}`}
                                                    target="_blank"
                                                    className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary"
                                                    title="View on site"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredComments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground leading-snug line-clamp-2 max-w-[400px]">
                                                    {comment.content}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    src={comment.author?.avatar}
                                                    alt={comment.author?.name}
                                                    size={32}
                                                />
                                                <span className="text-xs font-bold text-foreground/80">{comment.author?.name || "Guest"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-primary truncate max-w-[200px]">
                                                    {comment.thread?.title || "Unknown Thread"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(comment.id, 'comment')}
                                                    className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/${lang}/community/${comment.thread?.slug}`}
                                                    target="_blank"
                                                    className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary"
                                                    title="View Thread"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {((activeTab === 'threads' && filteredThreads.length === 0) || (activeTab === 'comments' && filteredComments.length === 0)) && (
                <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground/80">Nothing found here</h3>
                    <p className="text-sm text-muted-foreground">No results match your search query.</p>
                </div>
            )}
        </div>
    );
}
