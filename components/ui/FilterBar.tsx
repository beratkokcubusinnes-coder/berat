"use client";

import { Filter, Sparkles, TrendingUp } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterBarProps {
    categories: string[];
    models: string[];
    currentCategory?: string;
    currentModel?: string;
    currentSort?: string;
    lang: string;
    dict?: any;
}

export function FilterBar({ categories, models, currentCategory, currentModel, currentSort, lang, dict }: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                    className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={currentCategory || "all"}
                    onChange={(e) => updateFilter("category", e.target.value)}
                >
                    <option value="all">{dict?.Filters?.allCategories || "All Categories"}</option>
                    {categories.filter(c => c !== "all").map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Model Filter */}
            <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <select
                    className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={currentModel || "all"}
                    onChange={(e) => updateFilter("model", e.target.value)}
                >
                    <option value="all">{dict?.Filters?.allModels || "All Models"}</option>
                    {models.filter(m => m !== "all").map((mdl) => (
                        <option key={mdl} value={mdl}>{mdl}</option>
                    ))}
                </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <select
                    className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={currentSort || "newest"}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                >
                    <option value="newest">{dict?.Filters?.newest || "Newest First"}</option>
                    <option value="popular">{dict?.Filters?.popular || "Most Popular"}</option>
                </select>
            </div>
        </div>
    );
}
