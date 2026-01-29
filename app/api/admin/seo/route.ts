import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.seoSetting.findMany();

        // Convert to key-value object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("Error fetching SEO settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { settings, group } = body;
        // settings is { key: value, key2: value2 }

        const upsertPromises = Object.entries(settings).map(([key, value]) => {
            return prisma.seoSetting.upsert({
                where: { key: key },
                update: {
                    value: String(value),
                    group: group || 'global'
                },
                create: {
                    key: key,
                    value: String(value),
                    group: group || 'global'
                }
            });
        });

        await prisma.$transaction(upsertPromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating SEO settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
