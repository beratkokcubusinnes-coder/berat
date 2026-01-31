import ProfilePage from "@/components/profile/ProfilePage";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string, username: string }> }): Promise<Metadata> {
    const { username } = await params;
    const user = await prisma.user.findUnique({
        where: { username },
        select: { name: true, username: true, bio: true }
    });

    if (!user) return { title: "User Not Found" };

    return {
        title: `${user.name || user.username} (@${user.username}) | Promptda Profile`,
        description: user.bio || `Explore the AI prompt library and creative work of ${user.name || user.username} on Promptda.`,
    };
}

export default async function UserProfile({ params }: { params: Promise<{ lang: string, username: string }> }) {
    const { lang, username } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            prompts: {
                orderBy: { createdAt: 'desc' },
                include: { author: true }
            },
            scripts: {
                orderBy: { createdAt: 'desc' },
                include: { author: true }
            },
            hooks: {
                orderBy: { createdAt: 'desc' },
                include: { author: true }
            },
            blogPosts: {
                orderBy: { createdAt: 'desc' },
                include: { author: true }
            },
            _count: {
                select: {
                    prompts: true,
                    followers: true,
                    following: true,
                    favorites: true,
                }
            }
        }
    });

    if (!user) notFound();

    // Map Prisma result to expected ProfilePage format
    const formattedUser = {
        ...user,
        name: user.name || user.username,
        promptsCount: user._count.prompts,
        followers: user._count.followers,
        following: user._count.following,
        favoritesCount: user._count.favorites
    };

    return <ProfilePage user={formattedUser} lang={lang} dict={dict} isOwnProfile={session?.userId === user.id} sessionUser={session} />;
}

