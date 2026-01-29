import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } }, // SQLite search
                { content: { contains: search } }
            ];
        }

        const threads = await prisma.thread.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                },
                // Include if current user liked? Need session for that.
                // For simplified UI, we fetch likes separately or just counts.
                likes: true // Fetching all likes to check current user status in client is expensive but ok for MVP.
            },
            take: 50
        });

        // Transform slightly to hide full like list if needed, but for now raw is fine.
        return NextResponse.json(threads);

    } catch (error) {
        console.error("Error fetching threads:", error);
        return NextResponse.json({ message: "Error fetching threads" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        // Allow any logged in user, not just admin? 
        // User asked to "design the page" usually under /admin/community implies Admin management, 
        // BUT also "users can interact". Since path is /admin/community, assume it's the admin interface OR 
        // the main community interface placed there for now.
        // Let's allow users if they have a session.
        if (!session || !session.userId) {
            return NextResponse.json({ message: "Unauthorized: No user ID found" + JSON.stringify(session) }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, category, tags, prompt, mediaUrls } = body;

        if (!title || !content) {
            return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
        }

        // --- START OF SYSTEM SETTINGS ENFORCEMENT ---
        const { getSystemSetting } = await import('@/lib/settings');
        const dailyLimit = parseInt(await getSystemSetting('daily_community_post_limit'));
        const cooldownMinutes = parseInt(await getSystemSetting('post_cool_down_minutes'));

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Check Daily Limit
        const dailyCount = await prisma.thread.count({
            where: {
                authorId: session.userId as string,
                createdAt: { gte: startOfToday }
            }
        });

        if (dailyCount >= dailyLimit) {
            return NextResponse.json({ message: `Daily post limit reached (${dailyLimit}). Please try again tomorrow.` }, { status: 429 });
        }

        // Check Cooldown
        const lastThread = await prisma.thread.findFirst({
            where: { authorId: session.userId as string },
            orderBy: { createdAt: 'desc' }
        });

        if (lastThread) {
            const diffMinutes = (Date.now() - new Date(lastThread.createdAt).getTime()) / 60000;
            if (diffMinutes < cooldownMinutes) {
                const wait = Math.ceil(cooldownMinutes - diffMinutes);
                return NextResponse.json({ message: `Spam protection: Please wait ${wait} more minute(s) before posting again.` }, { status: 429 });
            }
        }
        // --- END OF SYSTEM SETTINGS ENFORCEMENT ---

        // Generate basic slug
        const slugBase = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        const randomString = Math.random().toString(36).substring(2, 7);
        const slug = `${slugBase}-${randomString}`;

        // Handle mediaUrls -> ensure it's a string
        let mediaString = null;
        if (mediaUrls) {
            mediaString = typeof mediaUrls === 'string' ? mediaUrls : JSON.stringify(mediaUrls);
        }

        const threadData = {
            title,
            slug,
            content,
            category: category || "General",
            tags: tags || null,
            prompt: prompt || null,
            mediaUrls: mediaString || null,
            authorId: session.userId as string,
        };

        console.log("Creating thread with data:", threadData);

        const thread = await prisma.thread.create({
            data: threadData
        });

        return NextResponse.json(thread);

    } catch (error: any) {
        console.error("Error creating thread:", error);
        return NextResponse.json({
            message: "Error creating thread",
            error: error.message || String(error)
        }, { status: 500 });
    }
}
