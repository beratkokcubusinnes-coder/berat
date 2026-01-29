import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { saveContentTranslation, getAllContentTranslations } from '@/lib/translations';

// GET: Fetch all translations for a content
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        if (!contentType || !contentId) {
            return NextResponse.json(
                { error: 'contentType and contentId are required' },
                { status: 400 }
            );
        }

        const translations = await getAllContentTranslations(
            contentType as any,
            contentId
        );

        return NextResponse.json(translations);
    } catch (error) {
        console.error('Error fetching translations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch translations' },
            { status: 500 }
        );
    }
}

// POST: Save multiple translations at once
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { contentType, contentId, translations } = body;

        if (!contentType || !contentId || !translations) {
            return NextResponse.json(
                { error: 'contentType, contentId, and translations are required' },
                { status: 400 }
            );
        }

        // Save each translation
        const results = await Promise.all(
            Object.entries(translations).map(([language, data]: [string, any]) =>
                saveContentTranslation(
                    contentType,
                    contentId,
                    language as any,
                    data
                )
            )
        );

        return NextResponse.json({
            success: true,
            saved: results.length,
        });
    } catch (error) {
        console.error('Error saving translations:', error);
        return NextResponse.json(
            { error: 'Failed to save translations' },
            { status: 500 }
        );
    }
}
