
import { PagesManager } from "@/components/admin/pages/PagesManager";
import { constructMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    return constructMetadata({
        title: "Static Pages Manager",
        noIndex: true
    });
}

export default async function PagesAdminPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Static Pages</h1>
                <p className="text-muted-foreground">Manage content for static pages like About, Terms, and Privacy.</p>
            </div>

            <PagesManager />
        </div>
    );
}
