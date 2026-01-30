"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Plus, Search, User, Settings, LogOut, Bell, Sun, Moon, Menu, X } from "lucide-react";
import Image from "next/image";
import UserAvatar from "@/components/ui/UserAvatar";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";
import { getHref } from "@/lib/i18n";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { cn } from "@/lib/utils";

export function TopNavbar({ lang, dict, user }: { lang: string, dict: any, user?: any }) {
    const pathname = usePathname();
    const { settings } = useSystemSettings();

    // Parse dynamic header components
    let headerItems: any[] = [];
    try {
        headerItems = JSON.parse(settings.navigation_header || "[]");
    } catch (e) { console.error("Header menu parse error", e); }

    const isVisible = (type: string) => !headerItems.find(i => i.type === type)?.hidden;

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isnotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Refs for clicking outside to close
    const langMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize theme from document class (set by the head script) or localStorage
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        function handleClickOutside(event: MouseEvent) {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const languages = [
        { code: 'en', name: 'English', flag: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" },
        { code: 'de', name: 'Deutsch', flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg" },
        { code: 'es', name: 'Español', flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg" },
        { code: 'tr', name: 'Türkçe', flag: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg" }
    ];

    const currentLang = languages.find(l => l.code === lang) || languages[0];

    const switchLanguage = (code: string) => {
        setIsLangMenuOpen(false);

        const knownLangs = ['en', 'de', 'es', 'tr'];
        const segments = pathname.split('/').filter(Boolean);

        // Remove existing locale prefix if present
        if (segments.length > 0 && knownLangs.includes(segments[0])) {
            segments.shift();
        }

        const nakedPath = `/${segments.join('/')}`;
        let newPath = '';

        if (code === 'en') {
            newPath = nakedPath;
        } else {
            newPath = `/${code}${nakedPath === '/' ? '' : nakedPath}`;
        }

        // Set the NEXT_LOCALE cookie so the middleware knows we explicitly changed language
        document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;

        window.location.href = newPath;
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
                {/* Mobile Menu Trigger & Search */}
                <div className="flex items-center gap-4 w-full max-w-md">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {isVisible('search') && (
                        <div className="flex items-center gap-4 w-full">
                            <div className="md:hidden">
                                <Link href={getHref('/', lang)} className="flex items-center gap-2">
                                    {settings.site_icon ? (
                                        <div className="relative w-8 h-8">
                                            <Image
                                                src={settings.site_icon.startsWith('http') ? settings.site_icon : (settings.site_icon.startsWith('/') ? settings.site_icon : `/${settings.site_icon}`)}
                                                alt={settings.site_icon_alt || "Logo"}
                                                fill
                                                className="object-contain"
                                                priority
                                                unoptimized={settings.site_icon.endsWith('.svg') || settings.site_icon.startsWith('http')}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">P</div>
                                    )}
                                </Link>
                            </div>
                            <div className="relative w-full hidden md:block group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder={dict.Navbar.searchPlaceholder}
                                    className="w-full bg-card/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            window.location.href = getHref(`/prompts?search=${(e.target as HTMLInputElement).value}`, lang);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Language Switcher Dropdown */}
                    {isVisible('language') && (
                        <div className="relative" ref={langMenuRef}>
                            <button
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                className="w-8 h-8 rounded-full overflow-hidden border border-border/50 hover:border-foreground/30 transition-colors relative focus:outline-none"
                            >
                                <Image
                                    src={currentLang.flag}
                                    alt={currentLang.name}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full transform scale-150"
                                    unoptimized
                                />
                            </button>

                            {isLangMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-200">
                                    {languages.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => switchLanguage(l.code)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-border/20 relative shrink-0">
                                                <Image src={l.flag} alt={l.name} fill className="object-cover scale-150" unoptimized />
                                            </div>
                                            <span>{l.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Theme Toggle */}
                    {isVisible('theme') && (
                        <button
                            onClick={toggleTheme}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {isVisible('upload') && (
                        <Link href={getHref('/upload', lang)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{dict.Navbar.upload}</span>
                        </Link>
                    )}

                    {user ? (
                        <>
                            {isVisible('notifications') && (
                                <NotificationBell userId={user?.userId || user?.id} />
                            )}

                            {isVisible('user') && (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 bg-card border border-border hover:border-foreground/20 text-foreground pl-2 pr-4 py-1.5 rounded-full transition-all"
                                    >
                                        <UserAvatar src={user?.avatar} alt={user?.name} size={28} className="ring-1 ring-border/50" />
                                        <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">{user.name || 'User'}</span>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-border">
                                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            <Link href={user.username ? getHref(`/profile/${user.username}`, lang) : getHref('/profile', lang)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span>{dict.UserMenu?.profile || "Profile"}</span>
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link href={getHref('/admin', lang)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-bold hover:bg-primary/5 transition-colors border-b border-border/50">
                                                    <Settings className="w-4 h-4" />
                                                    <span>{dict.UserMenu?.adminPanel || "Admin Panel"}</span>
                                                </Link>
                                            )}
                                            <Link href={getHref('/settings', lang)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                                <span>{dict.UserMenu?.settings || "Settings"}</span>
                                            </Link>
                                            <button
                                                onClick={() => logout()}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>{dict.UserMenu?.logout || "Log out"}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {isVisible('user') && (
                                <Link href={getHref('/login', lang)} className="flex items-center gap-2 bg-card hover:bg-card/80 border border-border text-foreground text-sm font-medium px-5 py-2 rounded-full transition-all">
                                    {dict.Navbar.login}
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
                    <div className="relative h-full flex flex-col p-8">
                        <div className="flex items-center justify-between mb-12">
                            <Link href={getHref('/', lang)} className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">P</div>
                                <span className="font-bold text-2xl tracking-tighter">{settings.site_name || "Promptda"}</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-4">
                            {JSON.parse(settings.navigation_sidebar || "[]").map((item: any) => (
                                <Link
                                    key={item.id}
                                    href={item.href.startsWith('http') ? item.href : getHref(item.href, lang)}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl text-xl font-bold text-foreground hover:bg-primary hover:text-white transition-all group"
                                >
                                    <span className="opacity-70 group-hover:opacity-100">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="pt-8 border-t border-border/50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex bg-muted rounded-xl p-1">
                                    {languages.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => switchLanguage(l.code)}
                                            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", lang === l.code ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                                        >
                                            {l.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={toggleTheme} className="p-3 bg-muted rounded-xl">
                                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </button>
                            </div>

                            {user ? (
                                <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-[2rem]">
                                    <UserAvatar src={user.avatar} alt={user.name} size={48} />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold truncate">{user.name}</p>
                                        <button onClick={() => logout()} className="text-xs text-red-500 font-bold uppercase tracking-widest">{dict.UserMenu.logout}</button>
                                    </div>
                                </div>
                            ) : (
                                <Link href={getHref('/login', lang)} className="block w-full text-center bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">
                                    {dict.Navbar.login}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
