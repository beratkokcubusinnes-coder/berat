import { getDictionary } from "@/lib/dictionary";
import { SeoSettingsForm } from "@/components/admin/seo/SeoSettingsForm";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    return {
        title: `SEO Manager`,
        description: `Configure search engine settings.`
    };
}

export default async function SeoPage({
    params
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">SEO Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure search engine visibility and metadata.</p>
                </div>
                <Link href={`/${lang}/admin/seo/redirects`}>
                    <button className="flex items-center gap-2 bg-card hover:bg-muted border border-border px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                        <ArrowLeftRight className="w-4 h-4" />
                        Manage Redirects
                    </button>
                </Link>
            </div>

            <SeoSettingsForm />
        </div>
    );
}
