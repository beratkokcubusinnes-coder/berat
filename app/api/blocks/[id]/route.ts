import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const block = await prisma.pageBlock.findUnique({ where: { id } });

        if (!block) {
            return NextResponse.json({ message: "Block not found" }, { status: 404 });
        }

        return NextResponse.json(block);
    } catch (error) {
        console.error("Error fetching block:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { title, adminLabel, type, identifier, placement, order, content, isActive } = await request.json();

        const block = await prisma.pageBlock.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(adminLabel !== undefined && { adminLabel }),
                ...(type !== undefined && { type }),
                ...(identifier !== undefined && { identifier }),
                ...(placement !== undefined && { placement }),
                ...(order !== undefined && { order }),
                ...(content !== undefined && { content: typeof content === 'string' ? content : JSON.stringify(content) }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json(block);
    } catch (error) {
        console.error("Error updating block:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.pageBlock.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting block:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
