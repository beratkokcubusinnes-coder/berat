"use client";

import { useActionState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const lang = (routeParams?.lang as string) || "en";
    const type = searchParams.get("type") || "prompt";

    const createCategory = async (prevState: any, formData: FormData) => {
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const categoryType = formData.get("type") as string;
        const headline = formData.get("headline") as string;
        const seoContent = formData.get("seoContent") as string;

        try {
            const response = await fetch("/api/categories/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug, type: categoryType, description, headline, seoContent }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, message: error.message || "Failed to create category" };
            }

            window.location.href = `/${lang}/admin/categories?type=${categoryType}`;
            return { success: true, message: "Category created successfully!" };
        } catch (error) {
            return { success: false, message: "An error occurred" };
        }
    };

    const [state, formAction] = useActionState(createCategory, null);

    const typeLabels: Record<string, string> = {
        prompt: "Prompts",
        hook: "Hooks",
        tool: "Tools",
        blog: "Blog"
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            {/* Header */}
            <div>
                <Link
                    href={`/${lang}/admin/categories?type=${type}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Categories
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Create New Category</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Add a new category for {typeLabels[type]}
                </p>
            </div>

            {/* Form */}
            <form action={formAction} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <input type="hidden" name="type" value={type} />

                {/* Category Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground">
                        Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g., Photography, State Management"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="slug"
                        required
                        placeholder="e.g., photography, state-management"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <p className="text-xs text-muted-foreground">
                        URL-friendly version (lowercase, hyphens only)
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground">
                        Short Description
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Optional short description for listing pages"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                </div>

                {/* SEO Section */}
                <div className="pt-6 border-t border-border space-y-6">
                    <h3 className="font-bold text-lg">SEO & Info Box Settings</h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">
                            SEO Headline (H1)
                        </label>
                        <input
                            type="text"
                            name="headline"
                            placeholder="e.g., Best AI Photography Prompts Collection"
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <p className="text-xs text-muted-foreground">Appears at the top of the category page.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">
                            Info Box Content (Rich Text)
                        </label>
                        <textarea
                            name="seoContent"
                            rows={6}
                            placeholder="Detailed explanation, keyword rich text, etc. Supports basic HTML."
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <p className="text-xs text-muted-foreground">
                            This content will be displayed in an info box on the category page for SEO purposes.
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                {state?.message && (
                    <div className={`p-4 rounded-xl text-sm ${state.success
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>
                        {state.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Tag className="w-4 h-4" />
                    Create Category
                </button>
            </form>
        </div>
    );
}
