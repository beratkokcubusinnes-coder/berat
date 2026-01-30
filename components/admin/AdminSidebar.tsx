"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Sparkles, PieChart, Settings, LogOut, ChevronLeft, BarChart3, MessageSquare, Bell, Calendar, FileCode2, Anchor, Wrench, MessageCircle, BookOpen, Tag, Globe, Layout, Languages, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";

export function AdminSidebar({ lang, dict }: { lang: string, dict: any }) {
    const pathname = usePathname();
    const { settings } = useSystemSettings();

    const menuItems = [
        { name: dict.Admin.title, icon: LayoutDashboard, href: `/${lang}/admin`, exact: true },
        { name: dict.Admin.totalUsers, icon: Users, href: `/${lang}/admin/users` },
        { name: dict.Admin.approvals || "Waiting List", icon: Bell, href: `/${lang}/admin/approvals` },
        { name: dict.Admin.totalPrompts, icon: Sparkles, href: `/${lang}/admin/prompts` },
        { name: dict.Sidebar.scripts, icon: FileCode2, href: `/${lang}/admin/scripts` },
        { name: dict.Sidebar.hooks, icon: Anchor, href: `/${lang}/admin/hooks` },
        { name: dict.Navbar.tools || "Tools", icon: Wrench, href: `/${lang}/admin/tools` },
        { name: dict.Sidebar.community, icon: MessageCircle, href: `/${lang}/admin/community` },
        { name: dict.Sidebar.blog, icon: BookOpen, href: `/${lang}/admin/blog` },
        { name: "Categories", icon: Tag, href: `/${lang}/admin/categories` },
        { name: "Page Blocks", icon: Layout, href: `/${lang}/admin/blocks` },
        { name: dict.Admin.analytics, icon: BarChart3, href: `/${lang}/admin/analytics` },
    ];

    const generalItems = [
        { name: "Static Pages", icon: FileText, href: `/${lang}/admin/pages` },
        { name: "Social Manager", icon: MessageSquare, href: `/${lang}/admin/social` },
        { name: "Media Library", icon: ImageIcon, href: `/${lang}/admin/media` },
        { name: "SEO Settings", icon: Globe, href: `/${lang}/admin/seo` },
        { name: "🌍 Translations", icon: Languages, href: `/${lang}/admin/translations/test` },
        { name: dict.Admin.settings, icon: Settings, href: `/${lang}/admin/settings` },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border hidden md:flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center gap-3 group">
                    {settings.site_logo && settings.site_logo !== "/images/logo.png" ? (
                        <div className="relative h-9 w-full">
                            <img
                                src={settings.site_logo}
                                alt={settings.site_logo_alt}
                                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                                {settings.site_name ? settings.site_name.charAt(0).toUpperCase() : "P"}
                            </div>
                            <span className="font-bold text-lg text-foreground tracking-tight">{settings.site_name || "Promptda"}</span>
                        </>
                    )}
                </Link>
                <Link href={`/${lang}`} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Exit Admin">
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
                {/* Navigation */}
                <div>
                    <h5 className="px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-4">Navigation</h5>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* General */}
                <div>
                    <h5 className="px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-4">General</h5>
                    <nav className="space-y-1">
                        {generalItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
                <Link href={`/${lang}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all group">
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Exit Admin</span>
                </Link>
            </div>
        </aside>
    );
}
