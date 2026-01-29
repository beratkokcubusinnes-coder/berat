import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    Zap,
    PenTool,
    Code,
    FileCode,
    ArrowUpRight,
    Calendar,
    Activity
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics Dashboard | Admin Panel",
    description: "Platform statistics and performance metrics",
};

export default async function AnalyticsPage({
    params
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // 1. Get Basic Counts
    const [
        userCount,
        promptCount,
        scriptCount,
        hookCount,
        toolCount,
        blogCount
    ] = await Promise.all([
        prisma.user.count(),
        prisma.prompt.count(),
        prisma.script.count(),
        prisma.hook.count(),
        prisma.tool.count(),
        prisma.blogPost.count()
    ]);

    const totalContent = promptCount + scriptCount + hookCount + toolCount + blogCount;

    // 2. Get Recent Users (Last 30 days) to calculate growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await prisma.user.count({
        where: {
            createdAt: {
                gte: thirtyDaysAgo
            }
        }
    });

    const userGrowth = userCount > 0 ? Math.round((newUsers / userCount) * 100) : 0;

    // 3. Get Top Contributors
    const topCreators = await prisma.user.findMany({
        take: 5,
        orderBy: [
            { prompts: { _count: 'desc' } }
        ],
        include: {
            _count: {
                select: {
                    prompts: true,
                    scripts: true,
                    hooks: true,
                    blogPosts: true
                }
            }
        }
    });

    // 4. Calculate Category Percentages for Distribution Bar
    const getPercentage = (count: number) => totalContent > 0 ? Math.round((count / totalContent) * 100) : 0;

    const distribution = [
        { name: "Prompts", count: promptCount, percent: getPercentage(promptCount), color: "bg-blue-500", icon: Zap },
        { name: "Scripts", count: scriptCount, percent: getPercentage(scriptCount), color: "bg-purple-500", icon: FileText },
        { name: "Hooks", count: hookCount, percent: getPercentage(hookCount), color: "bg-pink-500", icon: Activity },
        { name: "Tools", count: toolCount, percent: getPercentage(toolCount), color: "bg-orange-500", icon: PenTool },
        { name: "Blog Posts", count: blogCount, percent: getPercentage(blogCount), color: "bg-green-500", icon: Calendar },
    ].sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time platform performance and statistics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">{userCount}</span>
                        <span className="text-xs font-bold text-green-500 flex items-center bg-green-500/10 px-1.5 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{userGrowth}%
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+{newUsers} new in last 30 days</p>
                </div>

                {/* Total Content */}
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Content</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">{totalContent}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Across 5 categories</p>
                </div>

                {/* Avg Engagement (Mock) */}
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Engagement Rate</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">4.2%</span>
                        <span className="text-xs font-bold text-green-500 flex items-center bg-green-500/10 px-1.5 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +0.8%
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Average interaction per user</p>
                </div>

                {/* System Health (Mock) */}
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">System Status</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-green-500">99.9%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content Distribution Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Content Distribution
                    </h2>

                    <div className="space-y-6">
                        {distribution.map((item) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className={`p-1.5 rounded-md ${item.color.replace('bg-', 'bg-').replace('500', '500/10')} ${item.color.replace('bg-', 'text-')}`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        {item.name}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">{item.count}</span>
                                        <span className="text-muted-foreground w-12 text-right">{item.percent}%</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <strong>Pro Tip:</strong> Focus on increasing content in <strong>{distribution[distribution.length - 1]?.name}</strong> category to achieve a balanced ecosystem.
                        </p>
                    </div>
                </div>

                {/* Top Creators */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Top Creators
                    </h2>

                    <div className="space-y-4">
                        {topCreators.map((user, index) => {
                            const userTotal = user._count.prompts + user._count.scripts + user._count.hooks + user._count.blogPosts;
                            return (
                                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border">
                                    <div className="flex items-center justify-center w-6 font-bold text-muted-foreground text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name || "User"} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                {(user.name || user.username || "?").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{user.name || user.username}</div>
                                        <div className="text-xs text-muted-foreground">{userTotal} items created</div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="bg-muted px-2 py-1 rounded-lg text-xs font-bold">
                                            Role: {user.role}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {topCreators.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No data available yet.
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-2">
                        View All Users
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
