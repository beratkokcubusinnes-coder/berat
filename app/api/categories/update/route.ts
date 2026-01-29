
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, name, slug, description, headline, seoContent } = await request.json();

        if (!id || !name || !slug) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Check if another category with this slug and type exists (excluding current one)
        // We need the type to check uniqueness properly, retrieve it first
        const currentCategory = await prisma.category.findUnique({
            where: { id }
        });

        if (!currentCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const existing = await prisma.category.findFirst({
            where: {
                slug,
                type: currentCategory.type,
                NOT: {
                    id
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Another category with this slug already exists" }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                description: description || null,
                headline: headline || null,
                seoContent: seoContent || null
            }
        });

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
