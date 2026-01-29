import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const id = formData.get("id") as string;

        if (!id) {
            return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        }

        // Cannot delete yourself
        if (id === session.userId) {
            return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 });
        }

        // Delete user and all related content
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.redirect(new URL(request.headers.get("referer") || "/admin/users", request.url));
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
