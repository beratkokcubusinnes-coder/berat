"use client";

import Link from "next/link";
import {
    Compass, Heart, Info, Mail, Shield, FileText,
    BookOpen, Sparkles, FileCode2, Anchor, Users,
    MessageCircle, Wrench, Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";

const ICON_MAP: Record<string, any> = {
    Compass, Sparkles, FileCode2, Anchor, Users, Wrench,
    MessageCircle, BookOpen, Heart, LinkIcon
};

import { getHref } from "@/lib/i18n";

export function Sidebar({ lang, dict, user }: { lang: string, dict: any, user?: any }) {
    const pathname = usePathname();
    const { settings } = useSystemSettings();

    // Parse dynamic menu from settings
    let navItems: any[] = [];
    try {
        const dynamicMenu = JSON.parse(settings.navigation_sidebar || "[]");
        navItems = dynamicMenu.map((item: any) => ({
            name: item.name,
            icon: ICON_MAP[item.icon] || LinkIcon,
            href: item.href.startsWith('http') ? item.href : getHref(item.href, lang),
            originalPath: item.href
        }));
    } catch (e) {
        console.error("Sidebar menu parse error", e);
    }

    if (user?.role === 'admin') {
        navItems.push({ name: dict.Sidebar.admin, icon: Shield, href: getHref('/admin', lang), originalPath: "/admin" });
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar/95 backdrop-blur-xl border-r border-border hidden md:flex flex-col z-50">
            {/* Logo */}
            <div className="p-6">
                <Link href={getHref('/', lang)} className="flex items-center gap-3 group">
                    {settings.site_logo && settings.site_logo !== "/images/logo.png" ? (
                        <div className="relative h-10 w-full">
                            <img
                                src={settings.site_logo}
                                alt={settings.site_logo_alt}
                                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                                P
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-foreground tracking-tight transition-colors">{settings.site_name || "Promptda"}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{dict.Sidebar.beta}</span>
                            </div>
                        </>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    // Check if active: exact match or handled by logic
                    const isActive = pathname === item.href || (item.originalPath === "/" && pathname === `/${lang}`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Info */}
            <div className="p-6 border-t border-border/50">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground/60 mb-4">
                    <Link href={getHref('/about', lang)} className="hover:text-muted-foreground transition-colors">{dict.Sidebar.about}</Link>
                    <Link href={getHref('/contact', lang)} className="hover:text-muted-foreground transition-colors">{dict.Sidebar.contact}</Link>
                    <Link href={getHref('/privacy', lang)} className="hover:text-muted-foreground transition-colors">{dict.Sidebar.privacy}</Link>
                    <Link href={getHref('/terms', lang)} className="hover:text-muted-foreground transition-colors">{dict.Sidebar.terms}</Link>
                </div>
                <p className="text-[10px] text-muted-foreground/40">© 2026 Promptda</p>
            </div>
        </aside>
    );
}
