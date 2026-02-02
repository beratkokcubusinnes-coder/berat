"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    className?: string;
}

export function Pagination({ totalPages, currentPage, className }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    // Calculate range of pages to show
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // Number of pages either side of current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        <nav className={cn("flex items-center justify-center gap-1 mt-12", className)}>
            <Link
                href={createPageUrl(Math.max(1, currentPage - 1))}
                className={cn(
                    "p-2 rounded-xl border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all shadow-sm",
                    currentPage === 1 && "pointer-events-none opacity-40"
                )}
                aria-label="Previous Page"
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <div key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    ) : (
                        <Link
                            key={`page-${page}`}
                            href={createPageUrl(page as number)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all",
                                currentPage === page
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                            )}
                        >
                            {page}
                        </Link>
                    )
                ))}
            </div>

            <Link
                href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                className={cn(
                    "p-2 rounded-xl border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all shadow-sm",
                    currentPage === totalPages && "pointer-events-none opacity-40"
                )}
                aria-label="Next Page"
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </nav>
    );
}
