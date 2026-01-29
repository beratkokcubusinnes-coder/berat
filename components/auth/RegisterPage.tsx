"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { register, AuthState } from "@/actions/auth";

const initialState: AuthState = {};

export default function RegisterPage({ params, dict }: { params: { lang: string }, dict: any }) {
    const { lang } = params;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [state, formAction, isPending] = useActionState(register, initialState);

    useEffect(() => {
        if (state?.success) {
            window.location.href = `/${lang}`;
        }
    }, [state, lang]);

    const ImageElement = (
        <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Mock Dashboard UI for Visual */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">🚀</div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/40 rounded-full" />
                        <div className="h-3 w-24 bg-white/20 rounded-full" />
                    </div>
                </div>

                <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 space-y-3 bg-white/5 rounded-xl p-3">
                            <div className="h-20 w-full bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg" />
                            <div className="h-2 w-12 bg-white/20 rounded-full" />
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 mt-4">
                    <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-lg">✓</div>
                    <div className="space-y-1">
                        <div className="h-3 w-40 bg-white/30 rounded-full" />
                        <div className="h-2 w-32 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Graphic text */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <h3 className="text-2xl font-bold text-white text-center px-4 leading-relaxed">
                    {dict.Auth?.joinNow || "Start your creative journey today."}
                </h3>
            </div>
        </div>
    );

    return (
        <AuthLayout
            lang={lang}
            title={dict.Auth.createAccount}
            subtitle={dict.Auth.joinNow}
            imageElement={ImageElement}
        >
            <form action={formAction} className="space-y-4">
                {state?.message && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {state.message}
                    </div>
                )}
                {state?.errors && !state.message && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        Please check the form for errors.
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">{dict.Auth.name}</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="Roger Gerrard"
                    />
                    {state?.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">{dict.Auth.email}</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="you@example.com"
                    />
                    {state?.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">{dict.Auth.password}</label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {state?.errors?.password && <p className="text-red-500 text-xs">{state.errors.password[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">{dict.Auth.confirmPassword}</label>
                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {state?.errors?.confirmPassword && <p className="text-red-500 text-xs">{state.errors.confirmPassword[0]}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {dict.Auth.register}
                </button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground uppercase">{dict.Auth.orContinueWith}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-full transition-all text-sm font-medium">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-full transition-all text-sm font-medium">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-.93 3.57-.93 1.6.02 2.6.81 3.24 1.74-2.89 1.85-2.4 5.91 1 7.41-.57 1.64-1.39 3.16-2.89 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                        Apple
                    </button>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    {dict.Auth.alreadyHaveAccount} <Link href={`/${lang}/login`} className="text-primary hover:underline">{dict.Auth.signInLink}</Link>
                </p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground/40 mt-12 pt-4 border-t border-white/5">
                    <span>{dict.Auth.copyright}</span>
                    <Link href="#" className="hover:text-white">{dict.Auth.privacy}</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
