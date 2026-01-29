import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // Find thread first to get ID, or use nested query
        const thread = await prisma.thread.findUnique({
            where: { slug },
            include: {
                comments: {
                    include: {
                        author: {
                            select: {
                                name: true,
                                username: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!thread) {
            return NextResponse.json({ message: "Thread not found" }, { status: 404 });
        }

        return NextResponse.json(thread.comments);

    } catch (error) {
        return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ message: "Content is required" }, { status: 400 });
        }

        // Find thread ID from slug
        const thread = await prisma.thread.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!thread) {
            return NextResponse.json({ message: "Thread not found" }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                threadId: thread.id,
                authorId: session.id
            },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(comment);

    } catch (error) {
        console.error("Comment error:", error);
        return NextResponse.json({ message: "Error creating comment" }, { status: 500 });
    }
}
