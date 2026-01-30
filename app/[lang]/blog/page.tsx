import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getBlogPosts } from "@/lib/db";
import { BookOpen, Calendar, User } from "lucide-react";
import { getContentWithTranslation } from "@/lib/translations";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { generateBreadcrumbSchema, generateCollectionPageSchema } from "@/lib/seo";

import { getSitemapAlternates } from "@/lib/sitemap-utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang) as any;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/blog';

    return {
        title: dict.Blog.metaTitle,
        description: dict.Blog.metaDescription,
        alternates: {
            canonical: `${baseUrl}/${lang}${path}`,
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function BlogPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ category?: string; sort?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const { category, sort } = await searchParams;

    const postsData = await getBlogPosts();
    const posts = await Promise.all(
        postsData.map(post => getContentWithTranslation(post, 'blog', post.id, lang as any))
    );

    // SEO Data
    const collectionSchema = generateCollectionPageSchema(
        "Blog - AI News, Tutorials & Insights",
        "Read the latest articles about AI, prompts, development, and productivity. Tutorials and Guides.",
        `https://promptda.com/${lang}/blog`
    );

    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Blog", item: `https://promptda.com/${lang}/blog` }
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
            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-8 max-w-[1920px] mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            {/* Breadcrumb Visual */}
                            <nav className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                <Link href={`/${lang}`} className="hover:text-primary transition-colors">Home</Link>
                                <span className="mx-2">/</span>
                                <span className="text-foreground">Blog</span>
                            </nav>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">Blog</h1>
                            <p className="text-sm text-muted-foreground mt-1">AI news, tutorials, and insights</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{posts.length}</span> articles
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <select className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground hover:border-gray-600 focus:outline-none transition-all">
                                <option value="all">All Categories</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="guide">Guide</option>
                                <option value="news">News</option>
                            </select>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-900">
                        {posts.map((post: any) => (
                            <Link
                                key={post.id}
                                href={`/${lang}/blog/${post.slug}`}
                                className="block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/5"
                            >
                                {/* Featured Image */}
                                <div className="relative h-48 bg-muted overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-white rounded-full text-xs font-bold">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{post.author.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{post.createdAt.toLocaleDateString()}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
