"use client";

import { Trash2, MoreHorizontal, Eye, Heart, Calendar, Sparkles, PenTool } from "lucide-react";
import { deleteAdminContent } from "@/actions/admin-content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PromptsListProps {
    prompts: any[];
    lang: string;
}

export function PromptsList({ prompts, lang }: PromptsListProps) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this prompt?")) {
            const res = await deleteAdminContent(id, 'prompt');
            if (res.success) {
                router.refresh();
            }
        }
    };

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest">
                            <th className="px-8 py-5">Prompt</th>
                            <th className="px-8 py-5">Model / Category</th>
                            <th className="px-8 py-5">Creator</th>
                            <th className="px-8 py-5">Performance</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {prompts.map((prompt) => (
                            <tr key={prompt.id} className="hover:bg-muted/10 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden relative border border-border shadow-sm group-hover:scale-105 transition-transform">
                                            <Image
                                                src={prompt.images.includes(',') ? prompt.images.split(',')[0] : prompt.images}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold text-foreground block truncate max-w-[250px]">{prompt.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md inline-block">ID: {prompt.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-purple-500" />
                                            <span className="text-xs font-bold text-foreground/80">{prompt.model}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{prompt.category}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary border border-primary/20">
                                            {prompt.author.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-semibold text-foreground">{prompt.author.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium block">@{prompt.author.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-foreground block">{prompt.views}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Views</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-foreground block">{prompt.likes}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Likes</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/${lang}/admin/prompts/${prompt.id}/edit`}
                                            className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20"
                                            title="Edit Prompt"
                                        >
                                            <PenTool className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(prompt.id)}
                                            className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-500/20"
                                            title="Delete Prompt"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground border border-transparent hover:border-border">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
