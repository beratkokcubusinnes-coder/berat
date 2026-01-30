import { getDictionary } from "@/lib/dictionary";
import { getThreadById } from "@/lib/db";
import { notFound } from "next/navigation";
import { ThreadEditForm } from "@/components/admin/ThreadEditForm";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default async function AdminEditThreadPage({
    params
}: {
    params: Promise<{ lang: string; id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const thread = await getThreadById(id);
    if (!thread) notFound();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <Link
                    href={`/${lang}/admin/community`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Community
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit Thread</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify community content to ensure it follows guidelines.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <ThreadEditForm thread={thread} lang={lang} />
        </div>
    );
}
