import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Recent Threads (Posts)
        const recentThreads = await prisma.thread.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true
            }
        });

        // 2. Recent Comments
        const recentComments = await prisma.comment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                    select: { name: true, username: true, avatar: true }
                },
                thread: {
                    select: { title: true, slug: true }
                }
            }
        });

        // 3. Active Users (Users who posted or commented recently)
        // This is a simplified approach using recent activity
        const recentPosters = await prisma.thread.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { authorId: true }
        });
        const recentCommenters = await prisma.comment.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { authorId: true }
        });

        const activeUserIds = Array.from(new Set([
            ...recentPosters.map(t => t.authorId),
            ...recentCommenters.map(c => c.authorId)
        ])).slice(0, 5);

        const activeUsers = await prisma.user.findMany({
            where: { id: { in: activeUserIds } },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true
            }
        });

        return NextResponse.json({
            recentThreads,
            recentComments,
            activeUsers
        });

    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({
            recentThreads: [],
            recentComments: [],
            activeUsers: []
        });
    }
}
