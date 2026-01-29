"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";

export function AuthLayout({
    children,
    title,
    subtitle,
    lang,
    imageElement
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    lang: string;
    imageElement: React.ReactNode;
}) {
    const { settings } = useSystemSettings();
    return (
        <div className="min-h-screen w-full flex bg-background relative overflow-hidden">

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 xl:px-24 z-10 relative">
                <Link
                    href={`/${lang}`}
                    className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="w-full max-w-sm space-y-8">
                    {/* Logo Mobile Only */}
                    <div className="lg:hidden mb-8">
                        <Link href={`/${lang}`} className="flex items-center gap-3">
                            {settings.site_logo && settings.site_logo !== "/images/logo.png" ? (
                                <img src={settings.site_logo} alt="Logo" className="w-10 h-10 object-contain" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                                        P
                                    </div>
                                    <span className="font-bold text-xl text-white tracking-tight">Promptda</span>
                                </>
                            )}
                        </Link>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900/50 items-center justify-center relative overflow-hidden border-l border-white/5">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

                {/* Content */}
                <div className="relative z-10 w-full max-w-lg px-8">
                    {imageElement}
                </div>
            </div>
        </div>
    );
}
