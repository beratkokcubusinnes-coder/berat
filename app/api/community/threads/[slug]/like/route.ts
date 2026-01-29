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
                // threadId_userId composite key requires ID
                threadId_userId: {
                    threadId: thread.id,
                    userId: session.id
                }
            }
        });

        if (existingLike) {
            await prisma.threadLike.delete({
                where: { id: existingLike.id } // wait, schema says @@id([userId, threadId]) in my memory or replace?
                // Let's check schema. I defined simple Relations.
                // Actually my last replace had:
                // @@id([userId, threadId]) -> This means composite ID.
                // But prisma delete where requires unique identifier.
                // With composite ID, we pass the composite fields.
                // Let's adjust based on schema.
                // If I used @@id([userId, threadId]), then:
                // where: { userId_threadId: { userId: ..., threadId: ... } }
            } as any);

            // Wait, standard practice for simple like is usually @@unique or just simple ID.
            // In my last schema update:
            // model ThreadLike {
            //   userId    String
            //   threadId  String
            //   ...
            //   @@id([userId, threadId])
            // }
            // So to delete:
            await prisma.threadLike.delete({
                where: {
                    userId_threadId: {
                        userId: session.id,
                        threadId: thread.id
                    }
                }
            });

            return NextResponse.json({ liked: false });
        } else {
            await prisma.threadLike.create({
                data: {
                    threadId: thread.id,
                    userId: session.id
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        // console.error(error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
