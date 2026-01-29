'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function followUser(followingId: string) {
    const session = await getSession()
    const userId = session?.userId as string | undefined

    if (!userId) return { error: 'Not authenticated' }
    if (userId === followingId) return { error: 'Cannot follow yourself' }

    try {
        await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: followingId
            }
        })
        revalidatePath(`/profile/${followingId}`)
        return { success: true }
    } catch (e) {
        return { error: 'Already following or database error' }
    }
}

export async function unfollowUser(followingId: string) {
    const session = await getSession()
    const userId = session?.userId as string | undefined

    if (!userId) return { error: 'Not authenticated' }

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: followingId
                }
            }
        })
        revalidatePath(`/profile/${followingId}`)
        return { success: true }
    } catch (e) {
        return { error: 'Not following or database error' }
    }
}

export async function isFollowing(followingId: string) {
    const session = await getSession()
    const userId = session?.userId as string | undefined

    if (!userId) return false

    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: followingId
            }
        }
    })
    return !!follow
}
export async function toggleFavorite(itemId: string, itemType: string) {
    const session = await getSession();
    const userId = session?.id as string | undefined;

    if (!userId) return { error: 'Not authenticated' };

    try {
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_itemId_itemType: {
                    userId,
                    itemId,
                    itemType
                }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            revalidatePath('/favorites');
            return { success: true, action: 'removed' };
        } else {
            await prisma.favorite.create({
                data: {
                    userId,
                    itemId,
                    itemType
                }
            });
            revalidatePath('/favorites');
            return { success: true, action: 'added' };
        }
    } catch (e) {
        console.error("Favorite error", e);
        return { error: 'Action failed' };
    }
}

export async function isFavorited(itemId: string, itemType: string) {
    const session = await getSession();
    const userId = session?.id as string | undefined;

    if (!userId) return false;

    const fav = await prisma.favorite.findUnique({
        where: {
            userId_itemId_itemType: {
                userId,
                itemId,
                itemType
            }
        }
    });
    return !!fav;
}
