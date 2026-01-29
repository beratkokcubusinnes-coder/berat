import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const redirects = await prisma.redirect.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(redirects);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching redirects" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { source, destination, code, isActive, isWildcard } = body;

        // Basic validation
        if (!source || (!destination && code !== 410)) {
            return NextResponse.json({ message: "Source and destination are required (except for 410)" }, { status: 400 });
        }

        // Ensure source starts with /
        const cleanSource = source.startsWith('/') ? source : `/${source}`;
        let cleanDestination = destination;

        if (code !== 410) {
            cleanDestination = destination.startsWith('http') ? destination : (destination.startsWith('/') ? destination : `/${destination}`);
        } else {
            cleanDestination = "#gone"; // Placeholder for 410
        }

        const redirect = await prisma.redirect.create({
            data: {
                source: cleanSource,
                destination: cleanDestination,
                code: parseInt(code) || 301,
                isActive: isActive ?? true,
                isWildcard: isWildcard ?? false
            }
        });

        return NextResponse.json(redirect);
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint violation
            return NextResponse.json({ message: "A redirect for this source URL already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error creating redirect" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "ID required" }, { status: 400 });
        }

        await prisma.redirect.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting redirect" }, { status: 500 });
    }
}
