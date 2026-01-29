
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import CommunityDetailClient from "./CommunityDetailClient";
import { getThreadBySlug } from "@/lib/db";
import { generateBreadcrumbSchema, generateDiscussionForumPostingSchema } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const thread = await getThreadBySlug(slug) as any;

    if (!thread) return { title: 'Thread Not Found' };

    return {
        title: `${thread.title} | Promptda Community`,
        description: thread.content.substring(0, 160) + "...",
    };
}

export default async function ThreadDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    const thread = await getThreadBySlug(slug) as any;

    if (!thread) {
        notFound();
    }

    // SEO Schemas
    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Community", item: `https://promptda.com/${lang}/community` },
        { name: thread.title, item: `https://promptda.com/${lang}/community/${slug}` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    const discussionSchema = generateDiscussionForumPostingSchema({
        headline: thread.title,
        text: thread.content,
        authorName: thread.author.name,
        datePublished: thread.createdAt.toISOString(),
        comments: thread.comments
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(discussionSchema) }}
            />

            {/* Sidebar - Fixed Left */}
            <Sidebar lang={lang} dict={dict} user={session} />

            {/* Main Content Area */}
            <div className="md:ml-64 relative h-screen overflow-hidden flex flex-col">
                <TopNavbar lang={lang} dict={dict} user={session} />

                {/* Content */}
                <main className="flex-1 overflow-hidden">
                    {/* Pass initial data to client if possible, but for now keeping it as is to avoid breaking changes in props */}
                    <CommunityDetailClient lang={lang} slug={slug} user={session} />
                </main>
            </div>
        </div>
    );
}
