"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { languages, type LanguageCode } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { useState } from 'react';

interface LanguageSwitcherProps {
    currentLang: string;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Extract path without language prefix
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';

    const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentLanguage.flag}</span>
                <span className="text-xs text-muted-foreground uppercase">{currentLang}</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                        {languages.map((lang) => {
                            const isActive = lang.code === currentLang;
                            const href = `/${lang.code}${pathWithoutLang}`;

                            return (
                                <Link
                                    key={lang.code}
                                    href={href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : ''
                                        }`}
                                    hrefLang={lang.code}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{lang.name}</div>
                                        <div className="text-xs text-muted-foreground uppercase">
                                            {lang.code}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
