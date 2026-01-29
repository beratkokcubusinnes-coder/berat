import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;

        const thread = await prisma.thread.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!thread) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const existingLike = await prisma.threadLike.findUnique({
            where: {
                // userId_threadId composite key requires ID
                userId_threadId: {
                    threadId: thread.id,
                    userId: session.userId
                }
            }
        });

        if (existingLike) {
            await prisma.threadLike.delete({
                where: {
                    userId_threadId: {
                        userId: session.userId,
                        threadId: thread.id
                    }
                }
            });

            return NextResponse.json({ liked: false });
        } else {
            await prisma.threadLike.create({
                data: {
                    threadId: thread.id,
                    userId: session.userId
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        // console.error(error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
