import { MediaManagement } from "@/components/admin/MediaManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media Cleanup | Admin Panel",
    description: "Manage system storage and unused assets",
};

export default async function AdminMediaPage({
    params
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-foreground">Media Assets</h1>
                <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold">Optimize storage and delete orphan files</p>
            </div>

            <MediaManagement lang={lang} />
        </div>
    );
}
