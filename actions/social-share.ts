'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { TwitterApi } from 'twitter-api-v2';
// @ts-ignore
import { Facebook } from 'fb';
import { blocksToHtml } from "@/lib/block-to-html";

// Update types
type SocialPlatform = 'twitter' | 'facebook' | 'medium' | 'linkedin' | 'tumblr' | 'pinterest' | 'reddit';
type ContentType = 'prompt' | 'blog' | 'script' | 'hook' | 'tool';

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
            select: { id: true, title: true, slug: true, createdAt: true, image: true, ogImage: true }
        }),
        prisma.blogPost.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, slug: true, createdAt: true, published: true, image: true, ogImage: true }
        })
    ]);

    // Normalize and sort
    const combined = [
        ...prompts.map(p => ({ ...p, type: 'prompt' as const, image: p.ogImage || p.image })),
        ...blogs.map(b => ({ ...b, type: 'blog' as const, image: b.ogImage || b.image }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

    return combined;
}

// @ts-ignore
import tumblr from 'tumblr.js';

/**
 * Share to Twitter
 */
export async function shareToTwitter(contentId: string, contentType: ContentType, message: string, url: string): Promise<ShareResult> {
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

        // Use Read-Write client if possible, or just default.
        // v2.tweet is the correct endpoint.
        const tweet = await client.v2.tweet(`${message}\n\n${url}`);
        return { success: true, platform: 'twitter', postId: tweet.data.id };

    } catch (error: any) {
        console.error('Twitter Share Error:', JSON.stringify(error, null, 2));
        // Try to safely extract error message from Twitter's structure
        const apiErrors = error.data?.errors || error.errors;
        const mainMsg = apiErrors ? apiErrors.map((e: any) => e.message || e.detail).join(', ') : error.message;
        return { success: false, platform: 'twitter', error: mainMsg || 'Unknown Twitter Error' };
    }
}

/**
 * Share to Facebook
 */
export async function shareToFacebook(contentId: string, contentType: ContentType, message: string, url: string): Promise<ShareResult> {
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
export async function shareToMedium(contentId: string, contentType: ContentType, title: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();
    const token = creds.medium_integration_token;

    if (!token) {
        return { success: false, platform: 'medium', error: 'Missing Medium Integration Token.' };
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
            throw new Error(err.errors?.[0]?.message || `Failed to fetch Medium User (${meRes.status})`);
        }

        const meData = await meRes.json();
        const userId = meData.data?.id;

        if (!userId) throw new Error("Could not retrieve Medium User ID");

        // 2. Fetch Full Content
        let contentHtml = "";
        let tags: string[] = [];

        if (contentType === 'blog') {
            const blog = await prisma.blogPost.findUnique({ where: { id: contentId } });
            if (!blog) throw new Error("Blog post not found");

            let blogContent = blog.content;
            if (blogContent && (blogContent.startsWith('[{"') || blogContent.startsWith('[ { "'))) {
                try {
                    const blocks = JSON.parse(blogContent);
                    blogContent = blocksToHtml(blocks);
                } catch (e) { }
            }

            contentHtml = `<h1>${blog.title}</h1>${blogContent}<hr><p>Originally published at: <a href="${url}">${url}</a></p>`;
            tags = ["ai", "tech", "blog"];
        } else {
            // Treat prompt, script, hook, tool similarly
            let item: any = null;
            if (contentType === 'prompt') item = await prisma.prompt.findUnique({ where: { id: contentId } });
            else if (contentType === 'script') item = await (prisma as any).script.findUnique({ where: { id: contentId } });
            else if (contentType === 'hook') item = await (prisma as any).hook.findUnique({ where: { id: contentId } });
            else if (contentType === 'tool') item = await (prisma as any).tool.findUnique({ where: { id: contentId } });

            if (!item) throw new Error(`${contentType} not found`);

            let descHtml = item.description;
            if (descHtml && (descHtml.startsWith('[{"') || descHtml.startsWith('[ { "'))) {
                try {
                    const blocks = JSON.parse(descHtml);
                    descHtml = blocksToHtml(blocks);
                } catch (e) { }
            }

            contentHtml = `
                <h1>${item.title}</h1>
                <div>${descHtml}</div>
                <hr>
                ${item.content ? `<h2>${contentType} Content:</h2><pre style="background: #f4f4f4; padding: 20px; border-radius: 10px; font-family: monospace;">${item.content}</pre>` : ''}
                <hr>
                <p>View the full ${contentType} here: <a href="${url}">${url}</a></p>
            `;
            tags = ["ai", contentType, "promptda"];
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
                publishStatus: "public", // Set to public for auto-post
                canonicalUrl: url
            })
        });

        if (!postRes.ok) {
            const err = await postRes.json();
            console.error("Medium Post Error:", err);
            throw new Error(err.errors?.[0]?.message || `Failed to publish to Medium (${postRes.status})`);
        }

        const postData = await postRes.json();
        return { success: true, platform: 'medium', postId: postData.data?.id };

    } catch (error: any) {
        console.error('Medium Share Error:', error);
        return { success: false, platform: 'medium', error: error.message || 'Unknown Error' };
    }
}

/**
 * Share to LinkedIn
 */
export async function shareToLinkedin(contentId: string, contentType: ContentType, message: string, url: string, imageUrl?: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();
    const token = creds.linkedin_access_token;
    const author = creds.linkedin_person_urn;

    if (!token || !author) {
        return { success: false, platform: 'linkedin', error: 'Missing LinkedIn Credentials (Token or URN)' };
    }

    try {
        const body = {
            author: `urn:li:person:${author}`,
            commentary: `${message}\n\n${url}`,
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            content: {
                article: {
                    source: url,
                    thumbnail: imageUrl || "",
                    title: message.split(':')[1]?.trim() || "New Content",
                    description: message.substring(0, 200)
                }
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false
        };

        const res = await fetch('https://api.linkedin.com/rest/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202306', // Use a recent version
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || JSON.stringify(err) || "LinkedIn API Error");
        }

        const data = await res.json();
        const postId = res.headers.get('x-linkedin-id') || data.id;
        return { success: true, platform: 'linkedin', postId: postId };

    } catch (error: any) {
        console.error('LinkedIn Share Error:', error.message);
        return { success: false, platform: 'linkedin', error: error.message || 'Unknown Error' };
    }
}

export async function shareToTumblr(contentId: string, contentType: ContentType, title: string, url: string): Promise<ShareResult> {
    const creds = await getSocialCredentials();

    if (!creds.tumblr_consumer_key || !creds.tumblr_consumer_secret || !creds.tumblr_token || !creds.tumblr_token_secret || !creds.tumblr_blog_identifier) {
        return { success: false, platform: 'tumblr', error: 'Missing Tumblr Credentials' };
    }

    try {
        const client = tumblr.createClient({
            consumer_key: creds.tumblr_consumer_key,
            consumer_secret: creds.tumblr_consumer_secret,
            token: creds.tumblr_token,
            token_secret: creds.tumblr_token_secret
        });

        let contentBody = "";
        let tags: string[] = [];

        if (contentType === 'prompt') {
            const prompt = await prisma.prompt.findUnique({ where: { id: contentId } });
            if (!prompt) throw new Error("Prompt not found");

            let descriptionHtml = prompt.description;
            if (descriptionHtml && (descriptionHtml.startsWith('[{"') || descriptionHtml.startsWith('[ { "'))) {
                try {
                    const blocks = JSON.parse(descriptionHtml);
                    descriptionHtml = blocksToHtml(blocks);
                } catch (e) { }
            }
            contentBody = `<h2>${prompt.title}</h2>${descriptionHtml}<br/><br/><strong>Prompt:</strong><br/><pre>${prompt.content}</pre><br/><br/>Source: <a href="${url}">${url}</a>`;
            tags = ["ai", "prompt", "chatgpt", "midjourney"];
        } else {
            const blog = await prisma.blogPost.findUnique({ where: { id: contentId } });
            if (!blog) throw new Error("Blog not found");

            let blogContent = blog.content;
            if (blogContent && (blogContent.startsWith('[{"') || blogContent.startsWith('[ { "'))) {
                try {
                    const blocks = JSON.parse(blogContent);
                    blogContent = blocksToHtml(blocks);
                } catch (e) { }
            }
            contentBody = `<h2>${blog.title}</h2>${blogContent}<br/><br/>Originally from: <a href="${url}">${url}</a>`;
            tags = ["ai", "blog", "tech", "web"];
        }

        // Promisify the callback-based tumblr.js
        const postResult = await new Promise((resolve, reject) => {
            client.createPost(creds.tumblr_blog_identifier, {
                // @ts-ignore
                type: 'text',
                title: title,
                body: contentBody,
                tags: tags,
                format: 'html'
            }, (err: any, data: any) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        return { success: true, platform: 'tumblr', postId: (postResult as any).id };

    } catch (error: any) {
        console.error('Tumblr Share Error:', error);
        return { success: false, platform: 'tumblr', error: error.message || "Unknown Tumblr Error" };
    }
}

/**
 * Share to Pinterest (Intent based for now as API requires complex app approval)
 */
export async function shareToPinterest(contentId: string, contentType: 'prompt' | 'blog', title: string, url: string, imageUrl?: string): Promise<ShareResult> {
    const description = title;
    const shareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(description)}`;

    return { success: true, platform: 'pinterest', postId: 'intent' };
}

/**
 * Share to Reddit
 */
export async function shareToReddit(contentId: string, contentType: 'prompt' | 'blog', title: string, url: string): Promise<ShareResult> {
    const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

    return { success: true, platform: 'reddit', postId: 'intent' };
}

/**
 * Automatically share content to all configured platforms
 */
export async function autoShareToAllPlatforms(contentId: string, contentType: ContentType, title: string, slug: string, imageUrl?: string) {
    const creds = await getSocialCredentials();
    const settings = await prisma.systemSetting.findFirst({
        where: { key: 'app_url' }
    });
    const baseUrl = settings?.value || process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const url = `${baseUrl}/${contentType === 'prompt' ? 'prompts' : 'blog'}/${slug}`;
    const message = `Check out our new ${contentType}: ${title}`;

    const results: ShareResult[] = [];

    // 1. Twitter
    if (creds.twitter_api_key && creds.twitter_api_secret && creds.twitter_access_token && creds.twitter_access_secret) {
        try { results.push(await shareToTwitter(contentId, contentType, message, url)); } catch (e) { }
    }

    // 2. Facebook
    if (creds.facebook_access_token && creds.facebook_page_id) {
        try { results.push(await shareToFacebook(contentId, contentType, message, url)); } catch (e) { }
    }

    // 3. Medium
    if (creds.medium_integration_token) {
        try { results.push(await shareToMedium(contentId, contentType, title, url)); } catch (e) { }
    }

    // 4. LinkedIn
    if (creds.linkedin_access_token && creds.linkedin_person_urn) {
        try { results.push(await shareToLinkedin(contentId, contentType, message, url, imageUrl)); } catch (e) { }
    }

    // 5. Tumblr
    if (creds.tumblr_consumer_key && creds.tumblr_blog_identifier) {
        try { results.push(await shareToTumblr(contentId, contentType, title, url)); } catch (e) { }
    }

    return results;
}
