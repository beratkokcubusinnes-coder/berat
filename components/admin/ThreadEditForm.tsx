"use client";

import { useState } from "react";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateAdminContent } from "@/actions/admin-content";

interface ThreadEditFormProps {
    thread: any;
    lang: string;
}

export function ThreadEditForm({ thread, lang }: ThreadEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append("type", "thread");

        try {
            const res = await updateAdminContent(thread.id, {}, formData);
            if (res.success) {
                router.push(`/${lang}/admin/community`);
                router.refresh();
            } else {
                alert(res.message || "Failed to update thread");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Thread Title</label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={thread.title}
                        required
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Content</label>
                    <textarea
                        name="content"
                        defaultValue={thread.content}
                        required
                        rows={10}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
                    />
                </div>

                {/* Categories & Tags for threads could be added here if needed, 
                    but for basic moderation title/content is enough */}
                <input type="hidden" name="category" value={thread.category || "General"} />

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                    <Link
                        href={`/${lang}/admin/community`}
                        className="px-8 py-4 rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </form>
    );
}
