import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
        }

        // Unlink related content
        await prisma.prompt.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
        await prisma.script.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
        await prisma.hook.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
        await prisma.tool.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
        await prisma.blogPost.updateMany({ where: { categoryId: id }, data: { categoryId: null } });

        // Delete the category
        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
