
import { NextResponse } from "next/server";
import { join } from "path";
import { promises as fs } from "fs";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const LANGUAGES = ['en', 'de', 'es', 'tr'];

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') { // Fixed role check case sensitivity
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    if (!LANGUAGES.includes(lang)) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    try {
        // 1. Read Base JSON
        const filePath = join(process.cwd(), 'messages', `${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(fileContent);

        // 2. Read DB Overrides
        const dbSettings = await prisma.systemSetting.findMany({
            where: {
                key: { startsWith: `seo_` }
            }
        });

        // Helper to get value
        const getVal = (section: string, field: string, defaultVal: any) => {
            const key = `seo_${section}_${field}_${lang}`;
            const dbSetting = dbSettings.find(s => s.key === key);
            return dbSetting ? dbSetting.value : defaultVal;
        };

        // Extract and Merge
        const seoSections = {
            Home: {
                metaTitle: getVal('Home', 'metaTitle', json.Home?.metaTitle),
                metaDescription: getVal('Home', 'metaDescription', json.Home?.metaDescription),
                // Hero Content
                verifiedLibrary: getVal('Home', 'verifiedLibrary', json.Home?.verifiedLibrary),
                heroTitlePart1: getVal('Home', 'heroTitlePart1', json.Home?.heroTitlePart1),
                heroTitlePart2: getVal('Home', 'heroTitlePart2', json.Home?.heroTitlePart2),
                heroTitlePart3: getVal('Home', 'heroTitlePart3', json.Home?.heroTitlePart3),
                heroSubtitle: getVal('Home', 'heroSubtitle', json.Home?.heroSubtitle),
                explorePrompts: getVal('Home', 'explorePrompts', json.Home?.explorePrompts),
                submitPrompt: getVal('Home', 'submitPrompt', json.Home?.submitPrompt),

                // Helper for arrays (JSON only for now unless we structure DB keys well)
                // For simplified editing, we might serialize arrays as JSON strings in DB if needed
                // But for now, let's keep array-based content from JSON or implement complex logic later
                popularCategories: json.Home?.popularCategoriesList,
                exploreByUseCaseLinks: json.Home?.exploreByUseCaseLinks,
                faqs: json.Home?.faqs
            },
            Prompts: {
                metaTitle: getVal('Prompts', 'metaTitle', json.Prompts?.metaTitle),
                metaDescription: getVal('Prompts', 'metaDescription', json.Prompts?.metaDescription)
            },
            Scripts: {
                metaTitle: getVal('Scripts', 'metaTitle', json.Scripts?.metaTitle),
                metaDescription: getVal('Scripts', 'metaDescription', json.Scripts?.metaDescription)
            },
            Hooks: {
                metaTitle: getVal('Hooks', 'metaTitle', json.Hooks?.metaTitle),
                metaDescription: getVal('Hooks', 'metaDescription', json.Hooks?.metaDescription)
            },
            Blog: {
                metaTitle: getVal('Blog', 'metaTitle', json.Blog?.metaTitle),
                metaDescription: getVal('Blog', 'metaDescription', json.Blog?.metaDescription)
            },
            Tools: {
                metaTitle: getVal('Tools', 'metaTitle', json.Tools?.metaTitle),
                metaDescription: getVal('Tools', 'metaDescription', json.Tools?.metaDescription)
            },
            Community: {
                metaTitle: getVal('Community', 'metaTitle', json.Community?.metaTitle),
                metaDescription: getVal('Community', 'metaDescription', json.Community?.metaDescription)
            },
        };

        return NextResponse.json(seoSections);
    } catch (error) {
        console.error("Error reading translation configuration:", error);
        return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { lang, updates } = body;

        if (!LANGUAGES.includes(lang)) {
            return NextResponse.json({ error: "Invalid language" }, { status: 400 });
        }

        const operations = [];

        // Updates format: { Home: { metaTitle: "...", ... }, Scripts: { ... } }
        for (const section of Object.keys(updates)) {
            const fields = updates[section];
            for (const field of Object.keys(fields)) {
                const value = fields[field];

                // Skip complex objects (like arrays) for now to avoid DB mess, 
                // unless we decide to JSON.stringify them.
                if (typeof value === 'object' && value !== null) {
                    continue;
                }

                const key = `seo_${section}_${field}_${lang}`;

                operations.push(
                    prisma.systemSetting.upsert({
                        where: { key },
                        update: { value: String(value) },
                        create: { key, value: String(value), type: 'seo' }
                    })
                );
            }
        }

        await prisma.$transaction(operations);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating translations:", error);
        return NextResponse.json({ error: "Failed to update translations" }, { status: 500 });
    }
}
