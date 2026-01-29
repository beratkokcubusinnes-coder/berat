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

  // Limit items for home page display - Prioritize Featured
  const featuredPrompts = realPrompts.filter((p: any) => p.isFeatured);
  const otherPrompts = realPrompts.filter((p: any) => !p.isFeatured);
  const displayPrompts = [...featuredPrompts, ...otherPrompts].slice(0, 5);
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

          {/* SEO HERO SECTION (H1) */}
          <section className="relative py-8 md:py-10 overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 px-6 md:px-10">
            <div className="relative z-10 max-w-4xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest animate-pulse">
                <Sparkles className="w-3 h-3" />
                {dict.Home.verifiedLibrary}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-[1.1]">
                {dict.Home.heroTitlePart1} <span className="text-primary italic">{dict.Home.heroTitlePart2}</span> {dict.Home.heroTitlePart3}
              </h1>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {dict.Home.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={getHref('/prompts', lang)} className="bg-foreground text-background px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/10">
                  {dict.Home.explorePrompts}
                </Link>
                <Link href={getHref('/upload', lang)} className="bg-card border border-border px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-primary transition-all">
                  {dict.Home.submitPrompt}
                </Link>
              </div>
            </div>
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          </section>

          <HomeSection title={dict.Home.featuredPrompts} icon={Sparkles} href={getHref('/prompts', lang)} color="text-yellow-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {displayPrompts.map((prompt: any) => (
                <PromptCard key={prompt.id} prompt={prompt} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* SEO CONTENT PANEL (H2 - 1) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-12 space-y-8">
              <div className="p-8 md:p-12 bg-card/30 backdrop-blur-xl border border-border rounded-[32px] shadow-2xl">
                <h2 className="text-3xl font-black text-foreground mb-6">{dict.Home.contentH2}</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg space-y-4">
                  <p>{dict.Home.contentText1}</p>
                  <p>{dict.Home.contentText2}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CATEGORY HUB (H2 - 2) */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">{dict.Home.popularCategories}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{dict.Home.popularSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div key={i} className="group p-8 bg-card border border-border rounded-3xl hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5">
                    <IconComponent className={cn("w-10 h-10 mb-6", color)} />
                    <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">Premium collection of professional grade AI interaction scripts for {cat.title?.toLowerCase()}.</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* EEAT / TRUST SECTION (H2 - 4) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-12">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-foreground">{dict.Home.whyProfessionals}</h2>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { title: dict.Home.reasons.tested, desc: dict.Home.reasons.testedDesc },
                  { title: dict.Home.reasons.updated, desc: dict.Home.reasons.updatedDesc },
                  { title: dict.Home.reasons.useCase, desc: dict.Home.reasons.useCaseDesc },
                  { title: dict.Home.reasons.friendly, desc: dict.Home.reasons.friendlyDesc }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-gradient-to-tr from-primary/20 to-transparent border border-white/5 overflow-hidden flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-card rounded-3xl border border-border flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                  <Terminal className="w-24 h-24 text-primary relative z-10" />
                </div>
              </div>
            </div>
          </section>

          {/* MAIN CONTENT GRIDS (Keep existing logic but H2) */}


          {/* HOW IT WORKS (H2 - 5) */}
          <section className="space-y-12 py-12 border-y border-border/50">
            <h2 className="text-4xl font-black text-foreground text-center">{dict.Home.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { step: "01", title: dict.Home.steps.step1, desc: dict.Home.steps.step1Desc },
                { step: "02", title: dict.Home.steps.step2, desc: dict.Home.steps.step2Desc },
                { step: "03", title: dict.Home.steps.step3, desc: dict.Home.steps.step3Desc }
              ].map((s, i) => (
                <div key={i} className="space-y-4">
                  <div className="text-6xl font-black text-primary/10 select-none leading-none">{s.step}</div>
                  <h4 className="text-xl font-black text-foreground">{s.title}</h4>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <HomeSection title={dict.Home.trending} icon={Sparkles} href={getHref('/prompts', lang)} color="text-primary" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {/* Use HookCard as an example here if needed, but let's just pass dict to existing ones */}
              {displayHooks.map((hook: any) => (
                <HookCard key={hook.id} hook={hook} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          <HomeSection title={dict.Home.popularCategories} icon={CheckCircle2} href={getHref('/categories', lang)} color="text-purple-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayTools.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          <HomeSection title={dict.Sidebar.community} icon={MessageCircle} href={getHref('/community', lang)} color="text-pink-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayThreads.map((thread: any) => (
                <CommunityCard key={thread.id} thread={thread} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          <HomeSection title={dict.Sidebar.blog} icon={BookOpen} href={getHref('/blog', lang)} color="text-orange-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayBlog.map((post: any) => (
                <BlogCard key={post.id} post={post} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          <HomeSection title={dict.Sidebar.members} icon={Users} href={getHref('/members', lang)} color="text-indigo-400" dict={dict}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {displayMembers.map((user: any) => (
                <MemberCard key={user.id} member={user} lang={lang} dict={dict} />
              ))}
            </div>
          </HomeSection>

          {/* INTERNAL LINK GOLDMINE (H2 - 6) */}
          <section className="bg-card/50 border border-border p-12 rounded-[40px] space-y-8">
            <h2 className="text-3xl font-black text-foreground">{dict.Home.exploreByUseCase}</h2>
            <div className="flex flex-wrap gap-4">
              {(dict.Home.exploreByUseCaseLinks || [
                "ChatGPT prompts for marketing", "ChatGPT prompts for sales",
                "AI prompts for video creation", "AI prompts for image generation",
                "Business Strategy Prompts", "Academic Writing AI Tools",
                "Customer Support Scripts", "Coding Assistant Hooks"
              ]).map((link: string, i: number) => (
                <Link key={i} href={getHref(`/prompts?search=${encodeURIComponent(link)}`, lang)} className="px-6 py-3 rounded-2xl bg-background border border-border hover:border-primary hover:text-primary font-bold text-sm transition-all">
                  {link}
                </Link>
              ))}
            </div>
          </section>



          {/* FAQ SECTION (H2 - 6) */}
          <section className="space-y-12 max-w-4xl mx-auto pb-12">
            <h2 className="text-4xl font-black text-foreground text-center">{dict.Home.faqTitle}</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group p-8 bg-card border border-border rounded-3xl open:border-primary/50 transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-lg list-none">
                    {faq.question}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-muted-foreground" />
                  </summary>
                  <div className="mt-6 pt-6 border-t border-border text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
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
