"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";

interface UsersFilterBarProps {
    lang: string;
}

export function UsersFilterBar({ lang }: UsersFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all" || !value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchValue = formData.get("search") as string;
        updateFilter("search", searchValue);
    };

    return (
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            name="search"
                            defaultValue={searchParams.get("search") || ""}
                            placeholder="Search by name, email, or username..."
                            className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </form>
                </div>

                {/* Role Filter */}
                <div className="flex gap-2">
                    <select
                        value={searchParams.get("role") || "all"}
                        onChange={(e) => updateFilter("role", e.target.value)}
                        className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>

                    <select
                        value={searchParams.get("banned") || "all"}
                        onChange={(e) => updateFilter("banned", e.target.value)}
                        className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="false">Active</option>
                        <option value="true">Banned</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
