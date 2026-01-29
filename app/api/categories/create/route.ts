import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, slug, type, description, headline, seoContent } = await request.json();

        if (!name || !slug || !type) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Check if category with this slug and type already exists
        const existing = await prisma.category.findUnique({
            where: {
                slug_type: {
                    slug,
                    type
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Category with this slug already exists" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                type,
                description: description || null,
                headline: headline || null,
                seoContent: seoContent || null
            }
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
