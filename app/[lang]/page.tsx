import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PromptCard } from "@/components/ui/PromptCard";
import { BlogCard } from "@/components/ui/BlogCard";
import { CommunityCard } from "@/components/ui/CommunityCard";
import { ToolCard } from "@/components/ui/ToolCard";
import {
  ChevronDown, ArrowRight, Sparkles, FileCode2,
  Anchor, Wrench, MessageCircle, BookOpen, Users,
  ImageIcon, CheckCircle2, Terminal
} from "lucide-react";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { getHref } from "@/lib/i18n";
import { generateWebSiteSchema, generateFAQSchema, generateItemListSchema } from "@/lib/seo";
import { getSession } from "@/lib/session";
import { getPrompts, getScripts, getHooks, getTools, getThreads, getBlogPosts, getUsers } from "@/lib/db";
import { cn } from "@/lib/utils";
import { getPageSeo } from "@/lib/seo-settings";
import { constructMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const seo = await getPageSeo("Home", lang);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

  return constructMetadata({
    title: seo.rawTitle === 'Home' ? undefined : seo.rawTitle,
    description: seo.description,
    image: seo.image,
    alternates: {
      canonical: lang === 'en' ? `${baseUrl}/` : `${baseUrl}/${lang}`,
      languages: {
        'en': `${baseUrl}/`,
        'tr': `${baseUrl}/tr`,
        'de': `${baseUrl}/de`,
        'es': `${baseUrl}/es`,
        'x-default': `${baseUrl}/`
      }
    }
  });
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang) as any;
  const session = await getSession();

  // Parallel fetching of all home page content
  const [
    realPrompts,
    scripts,
    hooks,
    tools,
    threads,
    blogPosts,
    users
  ] = await Promise.all([
    getPrompts(),
    getScripts(),
    getHooks(),
    getTools(),
    getThreads(),
    getBlogPosts(),
    getUsers()
  ]);

  // Limit items for home page display
  const displayPrompts = realPrompts.slice(0, 4);
  const displayBlog = blogPosts.slice(0, 3);
  const displayThreads = threads.slice(0, 4);
  const displayTools = tools.slice(0, 4);

  // SEO DATA
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
  const websiteSchema = generateWebSiteSchema(baseUrl);

  const trendingItemsSchema = generateItemListSchema(
    displayPrompts.map((p: any) => ({
      name: p.title,
      url: `${baseUrl}/${lang}/prompt/${p.categoryData?.slug || 'general'}/${p.slug}`,
      image: p.images?.split(',')[0]
    })),
    "Trending AI Prompts"
  );

  const faqs = (dict.Home.faqs as any[]) || [];
  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trendingItemsSchema) }}
      />

      <Sidebar lang={lang} dict={dict} user={session} />

      <div className="md:ml-64 relative">
        <TopNavbar lang={lang} dict={dict} user={session} />

        <main className="p-6 md:p-8 space-y-24 max-w-[1920px] mx-auto pb-24">

          {/* 1. TRENDING NOW */}
          <HomeSection title={dict.Home.trending} icon={Sparkles} href={getHref('/prompts', lang)} color="text-primary" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayPrompts.map((prompt: any, index: number) => (
                <PromptCard key={prompt.id} prompt={prompt} lang={lang} dict={dict} priority={index < 2} />
              ))}
            </div>
          </HomeSection>

          {/* 2. HERO SECTION */}
          <section className="relative py-12 md:py-16 overflow-hidden rounded-[40px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 px-8 md:px-12">
            <div className="relative z-10 max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                {dict.Home.verifiedLibrary}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.05]">
                {dict.Home.heroTitlePart1} <span className="text-primary italic">{dict.Home.heroTitlePart2}</span> {dict.Home.heroTitlePart3}
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-3xl">
                {dict.Home.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={getHref('/prompts', lang)} className="bg-foreground text-background px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">
                  {dict.Home.explorePrompts}
                </Link>
                <Link href={getHref('/upload', lang)} className="bg-card border border-border px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary transition-all">
                  {dict.Home.submitPrompt}
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
          </section>

          {/* 3. COMMUNITY */}
          <HomeSection title={dict.Sidebar.community} icon={MessageCircle} href={getHref('/community', lang)} color="text-pink-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayThreads.map((thread: any) => (
                <CommunityCard key={thread.id} thread={thread} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 4. BLOG */}
          <HomeSection title={dict.Sidebar.blog} icon={BookOpen} href={getHref('/blog', lang)} color="text-orange-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayBlog.map((post: any) => (
                <BlogCard key={post.id} post={post} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 5. POPULAR CATEGORIES */}
          <section className="space-y-16 py-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-foreground uppercase tracking-tight">{dict.Home.popularCategories}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{dict.Home.popularSub}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(dict.Home.popularCategoriesList || []).map((cat: any, i: number) => {
                const IconComponent = {
                  Sparkles, Wrench, Users, ImageIcon, FileCode2, Anchor
                }[cat.iconName as string] || Sparkles;
                return (
                  <div key={i} className="group p-10 bg-card border border-border rounded-[40px] hover:border-primary/50 transition-all cursor-pointer">
                    <IconComponent className="w-12 h-12 mb-8 text-primary" />
                    <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">Premium collection of professional grade AI prompts.</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. TOOLS */}
          <HomeSection title={dict.Sidebar.tools} icon={CheckCircle2} href={getHref('/tools', lang)} color="text-purple-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayTools.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 7. WHY CHOOSE US */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-24 bg-card/20 rounded-[64px] px-12 border border-border/50">
            <div className="space-y-10">
              <h2 className="text-5xl font-black text-foreground leading-tight">{dict.Home.whyProfessionals}</h2>
              <div className="grid grid-cols-1 gap-8">
                {Object.entries(dict.Home.reasons).filter(([k]) => !k.endsWith('Desc')).map(([key, title]: any, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground mb-2">{title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{dict.Home.reasons[key + 'Desc']}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex justify-center">
              <Terminal className="w-64 h-64 text-primary opacity-20" />
            </div>
          </section>

          {/* 8. FAQ */}
          <section className="space-y-16 max-w-4xl mx-auto pb-24">
            <h2 className="text-5xl font-black text-foreground text-center">{dict.Home.faqTitle}</h2>
            <div className="space-y-6">
              {faqs.map((faq: any, i: number) => (
                <details key={i} className="group p-10 bg-card border border-border rounded-[40px] open:border-primary/50 transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-black text-xl list-none tracking-tight">
                    {faq.question}
                    <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform text-muted-foreground" />
                  </summary>
                  <div className="mt-8 pt-8 border-t border-border/50 text-muted-foreground leading-relaxed text-lg">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* SEO CONTENT */}
          <section className="py-24 border-t border-border/30">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-black text-foreground">{dict.Home.contentH2}</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground text-lg space-y-6">
                <p>{dict.Home.contentText1}</p>
                <p>{dict.Home.contentText2}</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

function HomeSection({ title, icon: Icon, href, color, children, dict }: { title: string, icon: any, href: string, color: string, children: React.ReactNode, dict: any }) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-border/50 pb-6 mx-2">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl bg-muted/50", color)}>
            <Icon className="w-6 h-6 shadow-sm" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase tracking-widest">{title}</h2>
        </div>
        <Link href={href} className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
          {dict.Home.viewAll}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}
