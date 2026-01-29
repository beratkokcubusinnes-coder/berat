import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const identifier = searchParams.get("identifier");
        const placement = searchParams.get("placement");

        const blocks = await prisma.pageBlock.findMany({
            where: {
                ...(identifier && { identifier }),
                ...(placement && { placement }),
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });

        return NextResponse.json(blocks);
    } catch (error) {
        console.error("Error fetching blocks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { title, adminLabel, type, identifier, placement, order, content, isActive } = await request.json();

        if (!adminLabel || !type || !identifier || !placement) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const block = await prisma.pageBlock.create({
            data: {
                title,
                adminLabel,
                type,
                identifier,
                placement,
                order: order || 0,
                content: typeof content === 'string' ? content : JSON.stringify(content),
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(block, { status: 201 });
    } catch (error) {
        console.error("Error creating block:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
