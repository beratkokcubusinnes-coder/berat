'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { TwitterApi } from 'twitter-api-v2';
import { Facebook } from 'fb';

// Update types
type SocialPlatform = 'twitter' | 'facebook';

interface ShareResult {
    success: boolean;
    platform: SocialPlatform;
    error?: string;
    postId?: string;
}

/**
 * Save API Credentials
 */
export async function saveSocialCredentials(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const settings = [
        'twitter_api_key', 'twitter_api_secret', 'twitter_access_token', 'twitter_access_secret',
        'facebook_access_token', 'facebook_page_id'
    ];

    for (const key of settings) {
        const value = formData.get(key) as string;
        if (value) {
            await prisma.systemSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value, type: 'encrypted', category: 'social' }
            });
        }
    }

    revalidatePath('/admin/social');
    return { success: true };
}

export async function getSocialCredentials() {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const keys = [
        'twitter_api_key', 'twitter_api_secret', 'twitter_access_token', 'twitter_access_secret',
        'facebook_access_token', 'facebook_page_id'
    ];

    const data = await prisma.systemSetting.findMany({
        where: { key: { in: keys } }
    });

    const result: Record<string, string> = {};
    data.forEach(item => {
        result[item.key] = item.value;
    });

    return result;
}

/**
 * Get Shareable Content (Latest Prompts, Blogs, etc.)
 */
export async function getShareableContent(page = 1, limit = 20) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const skip = (page - 1) * limit;

    const [prompts, blogs] = await Promise.all([
        prisma.prompt.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, slug: true, createdAt: true }
        }),
        prisma.blogPost.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, slug: true, createdAt: true, published: true }
        })
    ]);

    // Normalize and sort
    const combined = [
        ...prompts.map(p => ({ ...p, type: 'prompt' as const })),
        ...blogs.map(b => ({ ...b, type: 'blog' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

    return combined;
}

/**
 * Share to Twitter
 */
export async function shareToTwitter(contentId: string, contentType: 'prompt' | 'blog', message: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();

    // Check credentials
    if (!creds.twitter_api_key || !creds.twitter_api_secret || !creds.twitter_access_token || !creds.twitter_access_secret) {
        return { success: false, platform: 'twitter', error: 'Missing Twitter Credentials' };
    }

    try {
        const client = new TwitterApi({
            appKey: creds.twitter_api_key,
            appSecret: creds.twitter_api_secret,
            accessToken: creds.twitter_access_token,
            accessSecret: creds.twitter_access_secret,
        });

        const tweet = await client.v2.tweet(`${message}\n\n${url}`);
        return { success: true, platform: 'twitter', postId: tweet.data.id };

    } catch (error: any) {
        console.error('Twitter Share Error:', error);
        return { success: false, platform: 'twitter', error: error.message || 'Unknown Error' };
    }
}

/**
 * Share to Facebook
 */
export async function shareToFacebook(contentId: string, contentType: 'prompt' | 'blog', message: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();

    if (!creds.facebook_access_token || !creds.facebook_page_id) {
        return { success: false, platform: 'facebook', error: 'Missing Facebook Credentials' };
    }

    const fb = new Facebook({
        accessToken: creds.facebook_access_token
    });

    try {
        const response = await fb.api(`${creds.facebook_page_id}/feed`, 'post', {
            message: message,
            link: url
        });

        if (!response || response.error) {
            throw new Error(response.error?.message || 'Facebook API Error');
        }

        return { success: true, platform: 'facebook', postId: response.id };

    } catch (error: any) {
        console.error('Facebook Share Error:', error);
        // FB library sometimes throws objects
        const errMsg = error.response ? JSON.stringify(error.response) : (error.message || 'Unknown Error');
        return { success: false, platform: 'facebook', error: errMsg };
    }
}
