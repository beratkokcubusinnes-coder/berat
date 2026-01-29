import { getDictionary } from "@/lib/dictionary";
import { getHooks } from "@/lib/db";
import { AdminContentList } from "@/components/admin/AdminContentList";
import Link from "next/link";
import { Plus, Anchor } from "lucide-react";

export default async function AdminHooksPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const hooks = await getHooks();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Hooks</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review and manage all user-submitted hooks.</p>
                </div>
                <Link
                    href={`/${lang}/admin/hooks/new`}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <Plus className="w-4 h-4" />
                    Add New Hook
                </Link>
            </div>

            <AdminContentList items={hooks} type="hook" lang={lang} />
        </div>
    );
}
