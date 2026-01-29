import { prisma } from "@/lib/prisma";

export async function getPageBlocks(identifier: string, placement: 'top' | 'bottom') {
    return await prisma.pageBlock.findMany({
        where: {
            identifier,
            placement,
            isActive: true
        },
        orderBy: { order: 'asc' }
    });
}

export async function getCategoryBlocks(categorySlug: string, placement: 'top' | 'bottom') {
    // Try specific category first, fallback to "category:all"
    const blocks = await prisma.pageBlock.findMany({
        where: {
            identifier: { in: [`category:${categorySlug}`, 'category:all'] },
            placement,
            isActive: true
        },
        orderBy: { order: 'asc' }
    });

    console.log(`[Blocks] Category: ${categorySlug}, Placement: ${placement}, Found: ${blocks.length}`);
    if (blocks.length > 0) {
        console.log(`[Blocks] Identifiers:`, blocks.map(b => b.identifier));
    }

    return blocks;
}
