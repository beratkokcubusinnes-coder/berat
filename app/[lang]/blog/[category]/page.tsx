import { getBlogPostsByCategory } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSession } from "@/lib/session";
import { BlogCard } from "@/components/ui/BlogCard";
import { BookOpen, Search, Filter } from "lucide-react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getContentWithTranslation } from "@/lib/translations";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string }> }): Promise<Metadata> {
    const { category: categorySlug } = await params;
    const category = await prisma.category.findFirst({
        where: { slug: categorySlug, type: 'blog' }
    });

    if (!category) return { title: 'Category Not Found' };

    return {
        title: `${category.name} Articles | AI Insights | Promptda`,
        description: `Read the latest ${category.name} articles and insights about AI, prompts, and engineering.`,
    };
}

export default async function CategoryBlogPage({
    params
}: {
    params: Promise<{ lang: string; category: string }>;
}) {
    const { lang, category: categorySlug } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    const category = await prisma.category.findFirst({
        where: { slug: categorySlug, type: 'blog' }
    });

    if (!category) {
        notFound();
    }

    const postsData = await getBlogPostsByCategory(categorySlug);
    const posts = await Promise.all(
        postsData.map(post => getContentWithTranslation(post, 'blog', post.id, lang as any))
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 space-y-12 max-w-[1920px] mx-auto pb-24">
                    {/* Premium Header Section */}
                    <section className="relative p-12 overflow-hidden rounded-[40px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest">
                                <BookOpen className="w-3.5 h-3.5" />
                                {category.name} Journal
                            </div>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                                {category.name} <span className="text-primary italic">Articles</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                {category.description || `Deep dives into ${category.name}, industry trends, and creative engineering workflows.`}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    </section>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder={`Search articles...`}
                                    className="bg-card border border-border rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 md:w-80"
                                />
                            </div>
                            <div className="h-10 w-px bg-border/50 hidden md:block" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-black text-foreground">{posts.length}</span> Articles Found
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl text-sm font-bold hover:border-primary transition-all">
                                <Filter className="w-4 h-4" />
                                Sort By
                            </button>
                        </div>
                    </div>

                    {/* Blog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {posts.map((post: any) => (
                            <BlogCard key={post.id} post={post} lang={lang} />
                        ))}

                        {posts.length === 0 && (
                            <div className="col-span-full py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                    <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">No articles in this category yet</h3>
                                    <p className="text-muted-foreground">Check back later or explore other categories.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
