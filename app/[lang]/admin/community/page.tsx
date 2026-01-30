import { getDictionary } from "@/lib/dictionary";
import { getThreads, getComments } from "@/lib/db";
import { AdminCommunityManager } from "@/components/admin/AdminCommunityManager";
import { MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community Management | Admin Panel",
    description: "Moderate community threads and comments",
};

export default async function AdminCommunityPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // Fetch data
    const [threads, comments] = await Promise.all([
        getThreads(),
        getComments()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-primary" />
                        Community Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Identify, edit, and delete community topics or comments.</p>
                </div>
                {/* Community usually happens on the frontend, but we add a link to create a thread if needed */}
                <Link
                    href={`/${lang}/community`}
                    target="_blank"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <Plus className="w-4 h-4" />
                    Visit Community
                </Link>
            </div>

            {/* Manager Component */}
            <AdminCommunityManager
                threads={threads}
                comments={comments}
                lang={lang}
                dict={dict}
            />
        </div>
    );
}
