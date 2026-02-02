import 'server-only'
import { prisma } from './prisma'
import { User as UserType } from '@/lib/types'

export async function getCategoriesByType(type: string) {
    return await prisma.category.findMany({
        where: { type },
        orderBy: { name: 'asc' }
    });
}

export async function getUsers(): Promise<any[]> {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    prompts: true,
                    followers: true,
                    following: true
                }
            }
        }
    })
}

export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email }
    })
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    prompts: true,
                    followers: true,
                    following: true
                }
            }
        }
    })
}

export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({
        where: { username } as any,
        include: {
            _count: {
                select: {
                    prompts: true,
                    followers: true,
                    following: true
                }
            }
        }
    })
}

export async function createUser(data: { id: string, name: string, email: string, passwordHash: string }) {
    // Basic username generation from email
    const username = data.email.split('@')[0] + '_' + Math.random().toString(36).substring(7);

    return await prisma.user.create({
        data: {
            id: data.id,
            name: data.name,
            email: data.email,
            password: data.passwordHash,
            username: username as any,
        } as any
    })
}

export async function getAdminStats() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
        userCount,
        promptCount,
        pendingCount,
        recentPrompts,
        promptViews,
        scriptViews,
        hookViews,
        toolViews,
        blogViews,
        categories,
        monthlyStats
    ] = await Promise.all([
        prisma.user.count(),
        prisma.prompt.count({ where: { status: 'APPROVED' } }),
        prisma.prompt.count({ where: { status: 'PENDING' } }),
        prisma.prompt.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        }),
        prisma.prompt.aggregate({ _sum: { views: true } }),
        prisma.script.aggregate({ _sum: { views: true } }),
        prisma.hook.aggregate({ _sum: { views: true } }),
        prisma.tool.aggregate({ _sum: { views: true } }),
        prisma.blogPost.aggregate({ _sum: { views: true } }),
        prisma.category.findMany({
            where: { type: 'prompt' },
            include: { _count: { select: { prompts: true } } },
            take: 4,
            orderBy: { prompts: { _count: 'desc' } }
        }),
        prisma.prompt.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: twelveMonthsAgo }
            },
            _count: true
        })
    ]);

    // Process monthly trends
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const trends = new Array(12).fill(0);

    monthlyStats.forEach(stat => {
        const month = stat.createdAt.getMonth();
        // Shift month index relative to 12 months ago if needed, 
        // but for a simple "last 12 months" display we just map to current year's months
        trends[month] += stat._count;
    });

    const totalViews = (promptViews._sum.views || 0) +
        (scriptViews._sum.views || 0) +
        (hookViews._sum.views || 0) +
        (toolViews._sum.views || 0) +
        (blogViews._sum.views || 0);

    return {
        userCount,
        promptCount,
        pendingCount,
        recentPrompts,
        totalViews,
        revenue: (promptCount * 0.45).toFixed(2), // Simple mock revenue
        categories: categories.map(c => ({
            name: c.name,
            count: c._count.prompts,
            percentage: promptCount > 0 ? Math.round((c._count.prompts / promptCount) * 100) : 0
        })),
        trends: trends.map((count, i) => ({
            label: months[i],
            value: count
        }))
    }
}

export async function getPrompts(take?: number, skip?: number, category?: string, model?: string) {
    const where: any = { status: 'APPROVED' };
    if (category && category !== 'all') where.category = category;
    if (model && model !== 'all') where.model = model;

    return await prisma.prompt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true },
        take,
        skip
    });
}

export async function getPromptsCount(category?: string, model?: string) {
    const where: any = { status: 'APPROVED' };
    if (category && category !== 'all') where.category = category;
    if (model && model !== 'all') where.model = model;

    return await prisma.prompt.count({ where });
}

export async function getPromptModels() {
    const prompts = await prisma.prompt.findMany({
        where: { status: 'APPROVED' },
        select: { model: true },
        distinct: ['model']
    });
    return prompts.map(p => p.model);
}

export async function getPromptById(id: string) {
    return await prisma.prompt.findUnique({
        where: { id },
        include: { author: true }
    });
}

export async function getPromptBySlug(slug: string, categorySlug?: string) {
    return await prisma.prompt.findUnique({
        where: { slug, status: 'APPROVED' },
        include: {
            author: true,
            categoryData: true
        }
    });
}

export async function getPromptsByCategory(categorySlug: string) {
    return await prisma.prompt.findMany({
        where: {
            status: 'APPROVED',
            categoryData: {
                slug: categorySlug
            }
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });
}

export async function getRelatedPrompts(categoryId: string | null, excludeId: string) {
    if (!categoryId) return [];
    return await prisma.prompt.findMany({
        where: {
            status: 'APPROVED',
            categoryId,
            id: { not: excludeId }
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { author: true }
    });
}

// Scripts
export async function getScripts() {
    return await prisma.script.findMany({
        where: { status: 'APPROVED' } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true } as any
    });
}

export async function createScript(data: any) {
    return await prisma.script.create({
        data: {
            ...data,
            authorId: data.authorId
        }
    });
}

export async function getRelatedScripts(categoryId: string | null, excludeId: string) {
    return await prisma.script.findMany({
        where: {
            status: 'APPROVED',
            categoryId,
            id: { not: excludeId }
        } as any,
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { author: true }
    });
}

export async function getScriptById(id: string) {
    return await prisma.script.findUnique({
        where: { id },
        include: { author: true }
    });
}

export async function getScriptBySlug(slug: string, categorySlug?: string) {
    return await prisma.script.findUnique({
        where: { slug, status: 'APPROVED' } as any,
        include: { author: true, categoryData: true } as any
    });
}

export async function getScriptsByCategory(categorySlug: string) {
    return await prisma.script.findMany({
        where: {
            status: 'APPROVED',
            categoryData: {
                slug: categorySlug
            }
        } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });
}

// Hooks
export async function getHooks() {
    return await prisma.hook.findMany({
        where: { status: 'APPROVED' } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true }
    });
}

export async function createHook(data: any) {
    return await prisma.hook.create({
        data: {
            ...data,
            authorId: data.authorId
        }
    });
}

export async function getRelatedHooks(categoryId: string | null, excludeId: string) {
    return await prisma.hook.findMany({
        where: {
            status: 'APPROVED',
            categoryId,
            id: { not: excludeId }
        } as any,
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { author: true }
    });
}

export async function getHookById(id: string) {
    return await prisma.hook.findUnique({
        where: { id },
        include: { author: true }
    });
}

export async function getHookBySlug(slug: string, categorySlug?: string) {
    return await prisma.hook.findUnique({
        where: { slug, status: 'APPROVED' } as any,
        include: { author: true, categoryData: true }
    });
}

export async function getHooksByCategory(categorySlug: string) {
    return await prisma.hook.findMany({
        where: {
            status: 'APPROVED',
            categoryData: {
                slug: categorySlug
            }
        } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });
}

// Blog Posts
export async function getBlogPosts() {
    return await prisma.blogPost.findMany({
        where: { status: 'APPROVED' } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true }
    });
}

export async function createBlogPost(data: any) {
    return await prisma.blogPost.create({
        data: {
            ...data,
            authorId: data.authorId,
            slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7)
        }
    });
}

export async function getBlogPostById(id: string) {
    return await (prisma as any).blogPost.findUnique({
        where: { id },
    });
}

export async function getBlogPostBySlug(slug: string, categorySlug?: string) {
    return await prisma.blogPost.findUnique({
        where: { slug },
        include: { author: true, categoryData: true }
    });
}

export async function getBlogPostsByCategory(categorySlug: string) {
    return await prisma.blogPost.findMany({
        where: {
            categoryData: {
                slug: categorySlug
            }
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });
}
// Tools
export async function getTools() {
    return await prisma.tool.findMany({
        where: { status: 'APPROVED' } as any,
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true }
    });
}

export async function createTool(data: any) {
    return await prisma.tool.create({
        data: {
            ...data,
            authorId: data.authorId
        }
    });
}

export async function getRelatedTools(categoryId: string | null, excludeId: string) {
    return await prisma.tool.findMany({
        where: {
            status: 'APPROVED',
            categoryId,
            id: { not: excludeId }
        } as any,
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { author: true }
    });
}

export async function getToolById(id: string) {
    return await prisma.tool.findUnique({
        where: { id },
        include: { author: true }
    });
}

export async function getToolBySlug(slug: string, categorySlug?: string) {
    return await prisma.tool.findUnique({
        where: { slug, status: 'APPROVED' } as any,
        include: { author: true, categoryData: true }
    });
}

export async function getToolsByCategory(categorySlug: string) {
    return await prisma.tool.findMany({
        where: {
            categoryData: {
                slug: categorySlug
            }
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true, categoryData: true }
    });
}

// Community Threads
export async function getThreads() {
    return await prisma.thread.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: true, _count: { select: { comments: true, likes: true } } }
    });
}

export async function getThreadById(id: string) {
    return await prisma.thread.findUnique({
        where: { id },
        include: { author: true }
    });
}

export async function getThreadBySlug(slug: string) {
    return await prisma.thread.findUnique({
        where: { slug },
        include: {
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            },
            _count: { select: { comments: true, likes: true } }
        }
    });
}

export async function getComments() {
    return await prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            thread: true
        }
    });
}
// Favorites
export async function getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    const results = await Promise.all(favorites.map(async (fav: any) => {
        let item = null;
        switch (fav.itemType) {
            case 'prompt':
                item = await prisma.prompt.findUnique({ where: { id: fav.itemId }, include: { author: true } });
                break;
            case 'script':
                item = await prisma.script.findUnique({ where: { id: fav.itemId }, include: { author: true } });
                break;
            case 'hook':
                item = await prisma.hook.findUnique({ where: { id: fav.itemId }, include: { author: true } });
                break;
            case 'tool':
                item = await prisma.tool.findUnique({ where: { id: fav.itemId }, include: { author: true } });
                break;
            case 'thread':
                item = await prisma.thread.findUnique({ where: { id: fav.itemId }, include: { author: true, _count: { select: { comments: true, likes: true } } } });
                break;
        }
        return item ? { ...item, itemType: fav.itemType } : null;
    }));

    return results.filter(i => i !== null);
}

// Moderation
export async function getPendingPrompts() {
    return await prisma.prompt.findMany({
        where: { status: 'PENDING' },
        include: { author: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function approvePrompt(id: string) {
    return await prisma.prompt.update({
        where: { id },
        data: { status: 'APPROVED' }
    });
}

export async function rejectPrompt(id: string) {
    return await prisma.prompt.update({
        where: { id },
        data: { status: 'REJECTED' }
    });
}
