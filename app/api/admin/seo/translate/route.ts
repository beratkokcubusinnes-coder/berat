
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { translateText } from "@/lib/translator";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { text, targetLang } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        if (!targetLang) {
            return NextResponse.json({ error: "Target language is required" }, { status: 400 });
        }

        const translatedText = await translateText(text, targetLang);

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
    }
}
