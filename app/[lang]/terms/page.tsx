
import { getDictionary } from "@/lib/dictionary";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/session";

import { getStaticPage } from "@/actions/admin/pages";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const page = await getStaticPage("terms");
    return {
        title: page?.metaTitle || "Terms of Service",
        description: page?.metaDescription
    };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;
    const session = await getSession();
    const page = await getStaticPage("terms");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />
            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />
                <main className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-4xl font-black">{page?.title || dict.Sidebar.terms}</h1>
                    {page?.content ? (
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                            {page.content}
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <p>By using Promptda, you agree to these Terms of Service. Please read them carefully.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
