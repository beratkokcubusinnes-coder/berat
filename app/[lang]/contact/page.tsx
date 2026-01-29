
import { getDictionary } from "@/lib/dictionary";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/session";

import { getStaticPage } from "@/actions/admin/pages";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const page = await getStaticPage("contact");
    return {
        title: page?.metaTitle || "Contact Us",
        description: page?.metaDescription
    };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;
    const session = await getSession();
    const page = await getStaticPage("contact");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />
            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />
                <main className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-4xl font-black">{page?.title || dict.Sidebar.contact}</h1>
                    {page?.content ? (
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                            {page.content}
                        </div>
                    ) : (
                        <p className="text-lg text-muted-foreground">
                            We'd love to hear from you. Please reach out to us at contact@promptda.com for any inquiries.
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}
