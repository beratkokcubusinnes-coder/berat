
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, path, tag } = await request.json();

        if (type === 'path' && path) {
            revalidatePath(path, 'page');
        } else if (type === 'all') {
            // Revalidate everything
            revalidatePath('/', 'layout');
        } else {
            // Default: clear homepage and main layout
            revalidatePath('/', 'layout');
        }

        return NextResponse.json({ success: true, message: "Cache cleared successfully" });
    } catch (error) {
        console.error("Revalidation error:", error);
        return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
    }
}
