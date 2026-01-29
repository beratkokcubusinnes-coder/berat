import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === "clear_cache") {
            // Revalidate the cache tag used in getSeoSettings
            revalidateTag("seo-settings");
            return NextResponse.json({ message: "SEO Settings cache cleared successfully." });
        }

        if (action === "ping_sitemaps") {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptda.com";
            const sitemapUrl = `${baseUrl}/sitemap.xml`;

            // Ping Google and Bing
            try {
                await Promise.all([
                    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`),
                    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
                ]);
                return NextResponse.json({ message: "Search engines pinged successfully." });
            } catch (error) {
                console.error("Ping failed:", error);
                return NextResponse.json({ message: "Partial success: Ping failed for some engines." }, { status: 200 }); // Still return 200
            }
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("SEO Action Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
