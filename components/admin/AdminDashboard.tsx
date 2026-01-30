"use client";

import { Users, Sparkles, Eye, TrendingUp, MoreHorizontal, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AdminDashboardProps {
    stats: any;
    lang: string;
    dict: any;
}

export default function AdminDashboard({ stats, lang, dict }: AdminDashboardProps) {
    const cards = [
        { title: dict.Admin.totalUsers, value: stats.userCount.toLocaleString(), trend: "+12.5%", isPositive: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: dict.Admin.totalPrompts, value: stats.promptCount.toLocaleString(), trend: "+8.2%", isPositive: true, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: dict.Admin.dailyViews, value: stats.totalViews > 1000 ? (stats.totalViews / 1000).toFixed(1) + 'k' : stats.totalViews, trend: "-2.4%", isPositive: false, icon: Eye, color: "text-orange-500", bg: "bg-orange-500/10" },
        { title: dict.Admin.revenue, value: `$${stats.revenue}`, trend: "+15.3%", isPositive: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    const categoryColors = ["text-primary", "text-purple-500", "text-orange-500", "text-emerald-500"];
    const categoryBgColors = ["bg-primary", "bg-purple-500", "bg-orange-500", "bg-emerald-500"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">{dict.Admin.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">Welcome back, Captain. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/20 transition-all group shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", card.bg, card.color)}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                                card.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                        <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trends Chart Mockup */}
                <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Usage Status</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Prompt creation trends this year</p>
                        </div>
                        <select className="bg-muted/50 border border-border text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none">
                            <option>This year</option>
                            <option>Last year</option>
                        </select>
                    </div>
                    {/* Dynamic Bar Chart */}
                    <div className="h-[300px] flex items-end justify-between gap-3 px-2">
                        {stats.trends.map((trend: any, i: number) => {
                            const maxHeight = Math.max(...stats.trends.map((t: any) => t.value));
                            const height = maxHeight > 0 ? (trend.value / maxHeight) * 90 : 5; // Min 5% height for visibility
                            return (
                                <div key={i} className="relative flex-1 group">
                                    <div
                                        className="bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-lg group-hover:shadow-[0_0_20px_theme(colors.primary/40%)]"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card text-foreground text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ring-1 ring-border shadow-lg">
                                            {trend.value}
                                        </div>
                                    </div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground/60">
                                        {trend.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Categories Overview */}
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-foreground">Categories</h3>
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* SVG Donut Chart with Dynamic Fill */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-muted/20" />
                                {stats.categories.map((cat: any, i: number) => {
                                    const circumference = 2 * Math.PI * 80;
                                    const percentage = (cat.count / stats.promptCount) * 100;
                                    const offset = circumference - (circumference * percentage) / 100;
                                    // This is a simplified offset, wouldn't correctly stack but visually better than static
                                    return (
                                        <circle
                                            key={i}
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            stroke="currentColor"
                                            strokeWidth="16"
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={offset}
                                            className={categoryColors[i] || "text-gray-400"}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-foreground">
                                    {stats.categories[0]?.percentage || 0}%
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                                    {stats.categories[0]?.name || "None"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-10">
                            {stats.categories.map((cat: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", categoryBgColors[i] || "bg-gray-400")} />
                                    <span className="text-xs font-medium text-muted-foreground truncate">{cat.name}</span>
                                    <span className="text-[10px] font-bold text-foreground/40 ml-auto">{cat.percentage}%</span>
                                </div>
                            ))}
                            {stats.categories.length === 0 && (
                                <p className="col-span-2 text-center text-xs text-muted-foreground">No data found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Prompts Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Recent Prompts</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Review the latest submissions from creators</p>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline transition-all">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Prompt Title</th>
                                <th className="px-6 py-4">Author</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats.recentPrompts.map((prompt: any) => (
                                <tr key={prompt.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden relative border border-border/50">
                                                {/* In real app we would check if images is JSON or string */}
                                                <Image
                                                    src={prompt.images.includes(',') ? prompt.images.split(',')[0] : prompt.images}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">{prompt.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-extrabold text-primary">
                                                {prompt.author.name.charAt(0)}
                                            </div>
                                            <span className="text-sm text-foreground/80 font-medium">{prompt.author.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-xs text-muted-foreground">
                                        {prompt.category}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentPrompts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No prompts found yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
