import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Categories | Admin Panel",
    description: "Create and manage categories for your content",
};

export default async function CategoriesPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ type?: string }>;
}) {
    const { lang } = await params;
    const { type } = await searchParams;
    const dict = await getDictionary(lang);

    const selectedType = type || "prompt";

    const categories = await prisma.category.findMany({
        where: { type: selectedType },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    prompts: true,
                    hooks: true,
                    tools: true,
                    blogPosts: true
                }
            }
        }
    });

    const types = [
        { value: "prompt", label: "Prompts", icon: "💬" },
        { value: "hook", label: "Hooks", icon: "🎣" },
        { value: "tool", label: "Tools", icon: "🔧" },
        { value: "blog", label: "Blog", icon: "📝" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Categories</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create and organize categories for your content</p>
                </div>
                <Link
                    href={`/${lang}/admin/categories/new?type=${selectedType}`}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </Link>
            </div>

            {/* Type Tabs */}
            <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                    <Link
                        key={t.value}
                        href={`/${lang}/admin/categories?type=${t.value}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedType === t.value
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                    </Link>
                ))}
            </div>

            {/* Categories List */}
            {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category: any) => {
                        const count = category._count[`${category.type}s`] || 0;
                        return (
                            <div
                                key={category.id}
                                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-primary" />
                                        <h3 className="font-bold text-lg">{category.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/${lang}/admin/categories/edit/${category.id}`}
                                            className="p-2 hover:bg-muted rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                        </Link>
                                        <DeleteCategoryButton id={category.id} />
                                    </div>
                                </div>
                                {category.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Slug: {category.slug}</span>
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded font-bold">
                                        {count} items
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No categories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first category to organize your {selectedType} content
                    </p>
                    <Link
                        href={`/${lang}/admin/categories/new?type=${selectedType}`}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Link>
                </div>
            )}
        </div>
    );
}
