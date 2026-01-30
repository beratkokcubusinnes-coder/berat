import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Share2, Calendar, User, Clock, ChevronLeft } from "lucide-react";
import { BlockRenderer } from "@/components/ui/BlockRenderer";
import UserAvatar from "@/components/ui/UserAvatar";
import { Metadata } from 'next';
import Link from 'next/link';

import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { getContentWithTranslation } from "@/lib/translations";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string; slug: string }> }): Promise<Metadata> {
    const { slug, lang } = await params;
    const postData = await getBlogPostBySlug(slug) as any;
    if (!postData) return { title: 'Post Not Found' };

    const post = await getContentWithTranslation(postData, 'blog', postData.id, lang as any);

    return {
        title: `${post.metaTitle || post.title} | Blog | Promptda`,
        description: post.metaDescription || post.excerpt || post.title,
    };
}

export default async function BlogPostDetailPage({
    params
}: {
    params: Promise<{ lang: string; category: string; slug: string }>;
}) {
    const { lang, category: categorySlug, slug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const postData = await getBlogPostBySlug(slug, categorySlug) as any;
    if (!postData) {
        notFound();
    }
    const post = await getContentWithTranslation(postData, 'blog', postData.id, lang as any);

    const date = new Date(post.createdAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Structure Data Generation
    const breadcrumbs = [
        { name: "Home", item: `https://promptda.com/${lang}` },
        { name: "Blog", item: `https://promptda.com/${lang}/blog` },
        { name: post.categoryData?.name || post.category, item: `https://promptda.com/${lang}/blog/${categorySlug}` },
        { name: post.title, item: `https://promptda.com/${lang}/blog/${categorySlug}/${slug}` }
    ];

    const articleSchema = generateArticleSchema({
        heading: post.title,
        image: post.image || "https://promptda.com/images/placeholder-blog.png",
        authorName: post.author.name,
        authorUrl: `https://promptda.com/${lang}/profile/${post.author.username}`,
        datePublished: post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        description: post.excerpt || post.metaDescription
    });

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
                    {/* Back button */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-4">
                        <Link
                            href={`/${lang}/blog`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Blog
                        </Link>
                        <span className="text-muted-foreground/30 text-xs">/</span>
                        <Link
                            href={`/${lang}/blog/${categorySlug}`}
                            className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                        >
                            {post.categoryData?.name || post.category}
                        </Link>
                    </nav>

                    {/* Article Header */}
                    <header className="space-y-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                                {post.categoryData?.name || post.category || "Article"}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                                {post.title}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 py-8 border-y border-border/50">
                            <div className="flex items-center gap-3">
                                <UserAvatar src={post.author.avatar} alt={post.author.name} size={40} className="border-2 border-primary/20" />
                                <div>
                                    <p className="text-sm font-black tracking-tight">{post.author.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Author</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border/50 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <time dateTime={post.createdAt.toISOString()} className="text-sm font-bold">{date}</time>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Published</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border/50 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-bold">5 min read</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Read Time</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <figure className="relative aspect-video w-full rounded-[40px] overflow-hidden border border-border shadow-2xl">
                        <Image
                            src={post.image || "/images/placeholder-blog.png"}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            className="object-cover"
                            priority
                            unoptimized
                        />
                        {post.imageCaption && (
                            <figcaption className="absolute bottom-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                {post.imageCaption}
                            </figcaption>
                        )}
                    </figure>

                    {/* Content */}
                    <article className="prose prose-invert prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary max-w-none text-muted-foreground leading-relaxed text-lg">
                        <BlockRenderer content={post.content} />
                    </article>

                    {/* Footer Share */}
                    <footer className="pt-12 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Share this article:</span>
                                <div className="flex items-center gap-2">
                                    <button className="p-3 bg-card border border-border rounded-xl hover:text-primary hover:border-primary transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <Link
                                href={`/${lang}/blog`}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20"
                            >
                                More Articles
                            </Link>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
