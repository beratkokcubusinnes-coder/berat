
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import CommunityClient from "./CommunityClient";
import { generateCollectionPageSchema, generateBreadcrumbSchema } from "@/lib/seo";

import { getPageSeo } from "@/lib/seo-settings";
import { getSitemapAlternates, getCanonicalUrl } from "@/lib/sitemap-utils";

import { constructMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const seo = await getPageSeo("Community", lang);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/community';

    return constructMetadata({
        title: seo.rawTitle,
        description: seo.description,
        image: seo.image,
        alternates: {
            canonical: getCanonicalUrl(path, lang, baseUrl),
            languages: getSitemapAlternates(path, baseUrl)
        }
    });
}

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    // SEO Data
    const collectionSchema = generateCollectionPageSchema(
        "Promptda Community",
        "Join the discussion, share prompts, and connect with other creators.",
        `https://promptda.com/${lang}/community`
    );

    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Community", item: `https://promptda.com/${lang}/community` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);


    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Sidebar - Fixed Left */}
            <Sidebar lang={lang} dict={dict} user={session} />

            {/* Main Content Area */}
            <div className="md:ml-64 relative h-screen overflow-hidden flex flex-col">
                <TopNavbar lang={lang} dict={dict} user={session} />

                {/* Content */}
                <main className="flex-1 overflow-hidden">
                    <CommunityClient lang={lang} user={session} />
                </main>
            </div>
        </div>
    );
}
