"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FilterList({ dict }: { dict: any }) {
    const categories = Object.values(dict) as string[];
    const [activeCategory, setActiveCategory] = useState(categories[0]); // Assumes 'All Models' is first

    return (
        <div className="w-full pb-4">
            <div className="flex flex-wrap gap-2 px-1">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cn(
                            "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                            activeCategory === category
                                ? "text-background border-transparent" // Contrast color
                                : "text-muted-foreground border-border hover:border-gray-500 hover:text-foreground bg-card/50"
                        )}
                    >
                        {activeCategory === category && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-foreground rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{category}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
