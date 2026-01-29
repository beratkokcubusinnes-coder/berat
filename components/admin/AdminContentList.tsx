"use client";

import { Trash2, MoreHorizontal, ExternalLink, Calendar, Eye, User, PenTool } from "lucide-react";
import { deleteAdminContent } from "@/actions/admin-content";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminContentListProps {
    items: any[];
    type: 'script' | 'hook' | 'blog' | 'tool';
    lang: string;
}

export function AdminContentList({ items, type, lang }: AdminContentListProps) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            const res = await deleteAdminContent(id, type);
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
                        <tr className="bg-muted/30 text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest text-[rgb(120,120,120)]">
                            <th className="px-8 py-5">Title</th>
                            <th className="px-8 py-5">Creator</th>
                            <th className="px-8 py-5">Stats</th>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">{item.title}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[300px]">
                                            {type === 'blog' ? item.slug : `ID: ${item.id}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-extrabold text-primary">
                                            {item.author.name?.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold text-foreground/80">{item.author.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs font-bold text-foreground">{item.views}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Link
                                            href={`/${lang}/admin/${type === 'blog' ? 'blog' : type + 's'}/edit/${item.id}`}
                                            className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-primary"
                                        >
                                            <PenTool className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground">
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
