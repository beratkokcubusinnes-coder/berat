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
            return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        }

        // Increment warnings
        const user = await prisma.user.update({
            where: { id },
            data: {
                warnings: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({ success: true, warnings: user.warnings }, { status: 200 });
    } catch (error) {
        console.error("Error warning user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
