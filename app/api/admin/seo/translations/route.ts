
import { NextResponse } from "next/server";
import { join } from "path";
import { promises as fs } from "fs";
import { getSession } from "@/lib/session";

const LANGUAGES = ['en', 'de', 'es', 'tr'];

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    if (!LANGUAGES.includes(lang)) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    try {
        const filePath = join(process.cwd(), 'messages', `${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(fileContent);

        // Extract only relevant SEO sections
        const seoSections = {
            Home: {
                metaTitle: json.Home?.metaTitle,
                metaDescription: json.Home?.metaDescription,
                // Hero Content
                verifiedLibrary: json.Home?.verifiedLibrary,
                heroTitlePart1: json.Home?.heroTitlePart1,
                heroTitlePart2: json.Home?.heroTitlePart2,
                heroTitlePart3: json.Home?.heroTitlePart3,
                heroSubtitle: json.Home?.heroSubtitle,
                explorePrompts: json.Home?.explorePrompts,
                submitPrompt: json.Home?.submitPrompt,

                // Popular Categories
                popularCategories: json.Home?.popularCategoriesList,

                // Footer Content
                exploreByUseCaseLinks: json.Home?.exploreByUseCaseLinks,
                faqs: json.Home?.faqs
            },
            Prompts: { metaTitle: json.Prompts?.metaTitle, metaDescription: json.Prompts?.metaDescription },
            Scripts: { metaTitle: json.Scripts?.metaTitle, metaDescription: json.Scripts?.metaDescription },
            Hooks: { metaTitle: json.Hooks?.metaTitle, metaDescription: json.Hooks?.metaDescription },
            Blog: { metaTitle: json.Blog?.metaTitle, metaDescription: json.Blog?.metaDescription },
            Tools: { metaTitle: json.Tools?.metaTitle, metaDescription: json.Tools?.metaDescription },
            Community: { metaTitle: json.Community?.metaTitle, metaDescription: json.Community?.metaDescription },
        };

        return NextResponse.json(seoSections);
    } catch (error) {
        console.error("Error reading translation file:", error);
        return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { lang, updates } = body;

        if (!LANGUAGES.includes(lang)) {
            return NextResponse.json({ error: "Invalid language" }, { status: 400 });
        }

        const filePath = join(process.cwd(), 'messages', `${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(fileContent);

        // Apply updates
        Object.keys(updates).forEach(section => {
            if (!json[section]) json[section] = {};
            const sectionUpdates = updates[section];

            // Apply all updates for this section
            Object.keys(sectionUpdates).forEach(key => {
                json[section][key] = sectionUpdates[key];
            });
        });

        await fs.writeFile(filePath, JSON.stringify(json, null, 4), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating translation file:", error);
        return NextResponse.json({ error: "Failed to update translations" }, { status: 500 });
    }
}
