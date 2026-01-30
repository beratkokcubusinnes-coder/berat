import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FilterList } from "@/components/ui/FilterList";
import { PromptCard } from "@/components/ui/PromptCard";
import { ScriptCard } from "@/components/ui/ScriptCard";
import { HookCard } from "@/components/ui/HookCard";
import { ToolCard } from "@/components/ui/ToolCard";
import { CommunityCard } from "@/components/ui/CommunityCard";
import { BlogCard } from "@/components/ui/BlogCard";
import { MemberCard } from "@/components/ui/MemberCard";
import {
  ChevronDown, ArrowRight, Sparkles, FileCode2,
  Anchor, Wrench, MessageCircle, BookOpen, Users,
  ImageIcon, CheckCircle2, Terminal
} from "lucide-react";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { getHref } from "@/lib/i18n";
import { generateWebSiteSchema, generateFAQSchema } from "@/lib/seo";

import { getSession } from "@/lib/session";
import { getPrompts, getScripts, getHooks, getTools, getThreads, getBlogPosts, getUsers } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang) as any;

  return {
    title: dict.Home.metaTitle,
    description: dict.Home.metaDescription,
    alternates: {
      canonical: `https://promptda.com/${lang}`,
      languages: {
        'en': 'https://promptda.com/en',
        'tr': 'https://promptda.com/tr',
        'de': 'https://promptda.com/de',
        'es': 'https://promptda.com/es',
        'x-default': 'https://promptda.com/en'
      }
    }
  };
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

  // Limit items for home page display - STRICTLY BY DATE (Newest First)
  const displayPrompts = realPrompts.slice(0, 4);
  const displayScripts = scripts.slice(0, 5);
  const displayHooks = hooks.slice(0, 5);
  const displayTools = tools.slice(0, 5);
  const displayThreads = threads.slice(0, 4);
  const displayBlog = blogPosts.slice(0, 3);
  const displayMembers = users.slice(0, 6);

  // SEO DATA
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
  const websiteSchema = generateWebSiteSchema(baseUrl);

  const faqs = (dict.Home.faqs as any[]) || [
    { question: "What is an AI prompt library?", answer: "An AI prompt library is a centralized ecosystem where prompt engineers share proven recipes for AI interaction. It helps users get better results from models like ChatGPT and Midjourney." },
    { question: "Are these prompts free to use?", answer: "Most of our community prompts are absolutely free to copy and use. We also offer premium, verified scripts for enterprise-level tasks." },
    { question: "Do these prompts work with ChatGPT?", answer: "Yes, our prompts are explicitly tested with ChatGPT (GPT-4o, o1), Claude, and other leading LLM models to ensure consistent performance." },
    { question: "How often is the library updated?", answer: "Our team and community release new tested prompts weekly, reflecting the latest changes in AI model behavior and capabilities." }
  ];
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

      <Sidebar lang={lang} dict={dict} user={session} />

      <div className="md:ml-64 relative">
        <TopNavbar lang={lang} dict={dict} user={session} />

        <main className="p-6 md:p-8 space-y-24 max-w-[1920px] mx-auto pb-24">

          {/* 1. TRENDING NOW - ABSOLUTE TOP */}
          <HomeSection title={dict.Home.trending} icon={Sparkles} href={getHref('/prompts', lang)} color="text-primary" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayPrompts.map((prompt: any) => (
                <PromptCard key={prompt.id} prompt={prompt} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 2. SEO HERO SECTION */}
          <section className="relative py-12 md:py-16 overflow-hidden rounded-[40px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 px-8 md:px-12">
            <div className="relative z-10 max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest animate-pulse">
                <Sparkles className="w-3 h-3" />
                {dict.Home.verifiedLibrary}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.05]">
                {dict.Home.heroTitlePart1} <span className="text-primary italic">{dict.Home.heroTitlePart2}</span> {dict.Home.heroTitlePart3}
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                {dict.Home.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={getHref('/prompts', lang)} className="bg-foreground text-background px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-2xl shadow-black/20">
                  {dict.Home.explorePrompts}
                </Link>
                <Link href={getHref('/upload', lang)} className="bg-card border border-border px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary transition-all">
                  {dict.Home.submitPrompt}
                </Link>
              </div>
            </div>
            {/* Background Glows */}
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

          {/* 4. BLOG / INSIGHTS */}
          <HomeSection title={dict.Sidebar.blog} icon={BookOpen} href={getHref('/blog', lang)} color="text-orange-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayBlog.map((post: any) => (
                <BlogCard key={post.id} post={post} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 5. POPULAR CATEGORIES (Category Hub) */}
          <section className="space-y-16 py-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-foreground uppercase tracking-tight">{dict.Home.popularCategories}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{dict.Home.popularSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(dict.Home.popularCategoriesList || [
                { title: "ChatGPT Prompts for Marketing", iconName: "Sparkles" },
                { title: "ChatGPT Prompts for Sales", iconName: "Wrench" },
                { title: "ChatGPT Prompts for Recruiters", iconName: "Users" },
                { title: "AI Image & Art Prompts", iconName: "ImageIcon" },
                { title: "SEO & Content Writing Prompts", iconName: "FileCode2" },
                { title: "Business & Strategy Prompts", iconName: "Anchor" }
              ]).map((cat: any, i: number) => {
                const IconComponent = {
                  Sparkles, Wrench, Users, ImageIcon, FileCode2, Anchor
                }[cat.iconName as string] || Sparkles;

                const colors = ["text-blue-400", "text-orange-400", "text-cyan-400", "text-pink-400", "text-emerald-400", "text-yellow-400"];
                const color = colors[i % colors.length];

                return (
                  <div key={i} className="group p-10 bg-card border border-border rounded-[40px] hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                    <IconComponent className={cn("w-12 h-12 mb-8", color)} />
                    <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">Premium collection of professional grade AI interaction scripts for {cat.title?.toLowerCase()}.</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. TOOLS SECTION */}
          <HomeSection title={dict.Home.popularCategories} icon={CheckCircle2} href={getHref('/categories', lang)} color="text-purple-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayTools.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* 7. EEAT / TRUST SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-24 bg-card/20 rounded-[64px] px-12 border border-border/50">
            <div className="space-y-10">
              <h2 className="text-5xl font-black text-foreground leading-tight">{dict.Home.whyProfessionals}</h2>
              <div className="grid grid-cols-1 gap-8">
                {[
                  { title: dict.Home.reasons.tested, desc: dict.Home.reasons.testedDesc },
                  { title: dict.Home.reasons.updated, desc: dict.Home.reasons.updatedDesc },
                  { title: dict.Home.reasons.useCase, desc: dict.Home.reasons.useCaseDesc },
                  { title: dict.Home.reasons.friendly, desc: dict.Home.reasons.friendlyDesc }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground mb-2">{item.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[64px] bg-gradient-to-tr from-primary/20 to-transparent border border-white/5 overflow-hidden flex items-center justify-center p-12">
                <div className="w-full h-full bg-card rounded-[48px] border border-border flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
                  <Terminal className="w-32 h-32 text-primary relative z-10" />
                </div>
              </div>
            </div>
          </section>

          {/* 8. HOW IT WORKS */}
          <section className="space-y-16 py-24 border-y border-border/50">
            <h2 className="text-5xl font-black text-foreground text-center">{dict.Home.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center max-w-6xl mx-auto">
              {[
                { step: "01", title: dict.Home.steps.step1, desc: dict.Home.steps.step1Desc },
                { step: "02", title: dict.Home.steps.step2, desc: dict.Home.steps.step2Desc },
                { step: "03", title: dict.Home.steps.step3, desc: dict.Home.steps.step3Desc }
              ].map((s, i) => (
                <div key={i} className="space-y-6">
                  <div className="text-8xl font-black text-primary/10 select-none leading-none mb-8">{s.step}</div>
                  <h4 className="text-2xl font-black text-foreground">{s.title}</h4>
                  <p className="text-muted-foreground text-lg leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 9. EXPLORE BY USE CASE */}
          <section className="bg-card/50 border border-border p-16 rounded-[64px] space-y-12">
            <h2 className="text-4xl font-black text-foreground">{dict.Home.exploreByUseCase}</h2>
            <div className="flex flex-wrap gap-4">
              {(dict.Home.exploreByUseCaseLinks || [
                "ChatGPT prompts for marketing", "ChatGPT prompts for sales",
                "AI prompts for video creation", "AI prompts for image generation",
                "Business Strategy Prompts", "Academic Writing AI Tools",
                "Customer Support Scripts", "Coding Assistant Hooks"
              ]).map((link: string, i: number) => (
                <Link key={i} href={getHref(`/prompts?search=${encodeURIComponent(link)}`, lang)} className="px-8 py-4 rounded-2xl bg-background border border-border hover:border-primary hover:text-primary font-bold text-base transition-all shadow-sm hover:shadow-lg">
                  {link}
                </Link>
              ))}
            </div>
          </section>

          {/* 10. FAQ SECTION */}
          <section className="space-y-16 max-w-4xl mx-auto pb-24">
            <h2 className="text-5xl font-black text-foreground text-center">{dict.Home.faqTitle}</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <details key={i} className="group p-10 bg-card border border-border rounded-[40px] open:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl">
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

          {/* SEO CONTENT PANEL (Lowered but kept for SEO) */}
          <section className="py-24 border-t border-border/30">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-black text-foreground">{dict.Home.contentH2}</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg space-y-6">
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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
