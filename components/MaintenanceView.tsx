"use client";

import { Hammer, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function MaintenanceView({ lang }: { lang: string }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <Hammer className="w-12 h-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg border-4 border-background">
                    <Lock className="w-4 h-4" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight uppercase">
                Under Maintenance
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-10">
                We're currently fine-tuning the platform gears to provide a better experience. We'll be back shortly!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4 text-left">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 mt-1">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">Admin Access</h3>
                        <p className="text-xs text-muted-foreground">Admins can still login via /login to manage the platform.</p>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4 text-left">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mt-1">
                        <Hammer className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">ETA</h3>
                        <p className="text-xs text-muted-foreground">Estimated downtime is less than 30 minutes. Stay tuned.</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex items-center gap-6">
                <Link href={`/${lang}/login`} className="text-sm font-bold text-primary hover:underline">
                    Admin Login
                </Link>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="text-sm font-medium text-muted-foreground italic">
                    Promptda Security Protocol v2.4
                </span>
            </div>
        </div>
    );
}
