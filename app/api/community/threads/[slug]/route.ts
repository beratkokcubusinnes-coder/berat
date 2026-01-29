import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        const thread = await prisma.thread.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (!thread) {
            return NextResponse.json({ message: "Thread not found" }, { status: 404 });
        }

        // Increment view count (fire and forget)
        prisma.thread.update({
            where: { id: thread.id },
            data: { views: { increment: 1 } }
        }).catch(console.error);

        return NextResponse.json(thread);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching thread" }, { status: 500 });
    }
}
