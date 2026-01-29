import { TrendingUp, Users, Star, Zap } from "lucide-react";

interface Stat {
    label: string;
    value: string;
    icon?: string;
}

interface StatsBlockProps {
    title?: string;
    stats: Stat[];
}

const iconMap: Record<string, any> = {
    trending: TrendingUp,
    users: Users,
    star: Star,
    zap: Zap,
};

export function StatsBlock({ title, stats }: StatsBlockProps) {
    return (
        <section className="bg-gradient-to-br from-primary/5 via-background to-background border border-primary/10 rounded-3xl p-8 md:p-12 space-y-8">
            {title && (
                <h2 className="text-3xl font-bold text-foreground text-center">{title}</h2>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon ? iconMap[stat.icon] : Zap;
                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-6 bg-card/50 rounded-2xl border border-border hover:border-primary/30 transition-all"
                        >
                            {Icon && (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                            )}
                            <div className="text-4xl font-black text-foreground mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
