
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "site_favicon" }
        });

        if (setting && setting.value) {
            let faviconUrl = setting.value;

            // If it's a relative path starting with /
            if (faviconUrl.startsWith('/') && !faviconUrl.startsWith('//')) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
                faviconUrl = `${baseUrl}${faviconUrl}`;
            }

            return NextResponse.redirect(faviconUrl);
        }
    } catch (e) {
        console.error("Favicon route error:", e);
    }

    // Safe fallback to icon.png in public/images
    const fallbackBase = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    return NextResponse.redirect(`${fallbackBase}/images/icon.png`);
}
