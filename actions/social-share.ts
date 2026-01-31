'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { TwitterApi } from 'twitter-api-v2';
// @ts-ignore
import { Facebook } from 'fb';


// Update types
type SocialPlatform = 'twitter' | 'facebook' | 'medium' | 'linkedin' | 'tumblr';

interface ShareResult {
    success: boolean;
    platform: SocialPlatform;
    error?: string;
    postId?: string;
}

export async function saveSocialCredentials(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') throw new Error("Unauthorized");

    const settings = [
        'twitter_api_key', 'twitter_api_secret', 'twitter_access_token', 'twitter_access_secret',
        'facebook_access_token', 'facebook_page_id',
        'medium_integration_token',
        'linkedin_access_token', 'linkedin_person_urn',
        'tumblr_consumer_key', 'tumblr_consumer_secret', 'tumblr_token', 'tumblr_token_secret', 'tumblr_blog_identifier'
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
        'facebook_access_token', 'facebook_page_id',
        'medium_integration_token',
        'linkedin_access_token', 'linkedin_person_urn',
        'tumblr_consumer_key', 'tumblr_consumer_secret', 'tumblr_token', 'tumblr_token_secret', 'tumblr_blog_identifier'
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

/**
 * Share to Medium
 */
export async function shareToMedium(contentId: string, contentType: 'prompt' | 'blog', title: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();
    const token = creds.medium_integration_token;

    if (!token) {
        return { success: false, platform: 'medium', error: 'Missing Medium Integration Token' };
    }

    try {
        // 1. Get User ID
        const meRes = await fetch('https://api.medium.com/v1/me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!meRes.ok) {
            const err = await meRes.json();
            throw new Error(err.errors?.[0]?.message || "Failed to fetch Medium User");
        }

        const meData = await meRes.json();
        const userId = meData.data?.id;

        if (!userId) throw new Error("Could not retrieve Medium User ID");

        // 2. Fetch Full Content
        let contentHtml = "";
        let tags: string[] = [];

        if (contentType === 'prompt') {
            const prompt = await prisma.prompt.findUnique({ where: { id: contentId } });
            if (!prompt) throw new Error("Prompt not found");

            contentHtml = `
                <h1>${prompt.title}</h1>
                <p><strong>Description:</strong> ${prompt.description}</p>
                <hr>
                <h2>Prompt:</h2>
                <pre>${prompt.content}</pre>
                <hr>
                <p>View the full prompt here: <a href="${url}">${url}</a></p>
            `;
            tags = ["ai", "prompt-engineering", "chatgpt"];
        } else {
            const blog = await prisma.blogPost.findUnique({ where: { id: contentId } });
            if (!blog) throw new Error("Blog post not found");

            contentHtml = `
                <h1>${blog.title}</h1>
                ${blog.content}
                <hr>
                <p>Originally published at: <a href="${url}">${url}</a></p>
            `;
            tags = ["ai", "tech", "blog"];
        }

        // 3. Post to Medium
        const postRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                contentFormat: "html",
                content: contentHtml,
                tags: tags,
                publishStatus: "draft", // Publish as draft first for safety
                canonicalUrl: url
            })
        });

        if (!postRes.ok) {
            const err = await postRes.json();
            throw new Error(err.errors?.[0]?.message || "Failed to publish to Medium");
        }

        const postData = await postRes.json();
        return { success: true, platform: 'medium', postId: postData.data?.id };

    } catch (error: any) {
        console.error('Medium Share Error:', error.message);
        return { success: false, platform: 'medium', error: error.message || 'Unknown Error' };
    }
}

/**
 * Share to LinkedIn
 */
export async function shareToLinkedin(contentId: string, contentType: 'prompt' | 'blog', message: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();
    const token = creds.linkedin_access_token;
    const author = creds.linkedin_person_urn;

    if (!token || !author) {
        return { success: false, platform: 'linkedin', error: 'Missing LinkedIn Credentials (Token or URN)' };
    }

    try {
        const body = {
            author: `urn:li:person:${author}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: message
                    },
                    shareMediaCategory: "ARTICLE",
                    media: [
                        {
                            status: "READY",
                            description: {
                                text: message.substring(0, 200)
                            },
                            originalUrl: url,
                            title: {
                                text: message.split(':')[1]?.trim() || "New Content"
                            }
                        }
                    ]
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || JSON.stringify(err) || "LinkedIn API Error");
        }

        const data = await res.json();
        return { success: true, platform: 'linkedin', postId: data.id };

    } catch (error: any) {
        console.error('LinkedIn Share Error:', error.message);
        return { success: false, platform: 'linkedin', error: error.message || 'Unknown Error' };
    }
}

export async function shareToTumblr(contentId: string, contentType: 'prompt' | 'blog', title: string, url: string): Promise<ShareResult> {
    return { success: false, platform: 'tumblr', error: 'Please use manual share button.' };
}
