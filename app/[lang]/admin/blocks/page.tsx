import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Layout } from "lucide-react";

export const metadata = {
    title: "Page Blocks | Admin Panel",
    description: "Manage dynamic page blocks",
};

export default async function PageBlocksPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    const blocks = await prisma.pageBlock.findMany({
        orderBy: [{ identifier: 'asc' }, { order: 'asc' }]
    });

    const groupedBlocks = blocks.reduce((acc, block) => {
        if (!acc[block.identifier]) {
            acc[block.identifier] = [];
        }
        acc[block.identifier].push(block);
        return acc;
    }, {} as Record<string, typeof blocks>);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Page Blocks</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage dynamic content blocks for pages
                    </p>
                </div>
                <Link
                    href={`/${lang}/admin/blocks/new`}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <Plus className="w-4 h-4" />
                    Add Block
                </Link>
            </div>

            {/* Blocks by Page */}
            {Object.keys(groupedBlocks).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedBlocks).map(([identifier, pageBlocks]) => (
                        <div key={identifier} className="bg-card border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary" />
                                {identifier}
                            </h2>
                            <div className="space-y-3">
                                {pageBlocks.map((block) => (
                                    <Link
                                        key={block.id}
                                        href={`/${lang}/admin/blocks/${block.id}`}
                                        className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold">{block.adminLabel}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                <span>Type: {block.type}</span>
                                                <span>•</span>
                                                <span>Placement: {block.placement}</span>
                                                <span>•</span>
                                                <span>Order: {block.order}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {block.isActive ? (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No blocks yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first dynamic page block
                    </p>
                    <Link
                        href={`/${lang}/admin/blocks/new`}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Block
                    </Link>
                </div>
            )}
        </div>
    );
}
