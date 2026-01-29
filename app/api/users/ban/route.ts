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
        const reason = formData.get("reason") as string || "Violated community guidelines";

        if (!id) {
            return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        }

        // Ban user
        await prisma.user.update({
            where: { id },
            data: {
                banned: true,
                banReason: reason
            }
        });

        return NextResponse.redirect(new URL(request.headers.get("referer") || "/admin/users", request.url));
    } catch (error) {
        console.error("Error banning user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
