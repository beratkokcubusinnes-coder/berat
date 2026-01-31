'use server'

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { google } from "googleapis";

interface IndexingResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Send URL to IndexNow (Bing, Yandex, etc.)
 */
export async function submitToIndexNow(url: string, force = false): Promise<IndexingResult> {
    try {
        if (!force) {
            const session = await getSession();
            if (!session || session.role !== 'admin') throw new Error("Unauthorized");
        }

        const settings = await prisma.seoSetting.findMany({
            where: { key: { in: ['indexnow_key', 'indexnow_host'] } }
        });

        const key = settings.find(s => s.key === 'indexnow_key')?.value;
        const host = settings.find(s => s.key === 'indexnow_host')?.value || 'www.bing.com';

        if (!key) throw new Error("IndexNow Key not configured in SEO settings.");

        // Clean host and URL
        const bingEndpoint = `https://${host}/indexnow`;

        const payload = {
            host: new URL(url).hostname,
            key: key,
            keyLocation: `https://${new URL(url).hostname}/${key}.txt`,
            urlList: [url]
        };

        const response = await fetch(bingEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return { success: true, message: "URL submitted to IndexNow successfully." };
        } else {
            const text = await response.text();
            throw new Error(`IndexNow Error (${response.status}): ${text}`);
        }
    } catch (error: any) {
        console.error("IndexNow Submission Error:", error);
        return { success: false, message: "IndexNow submission failed.", error: error.message };
    }
}

/**
 * Send URL to Google Indexing API
 */
export async function submitToGoogleIndexing(url: string, force = false): Promise<IndexingResult> {
    try {
        if (!force) {
            const session = await getSession();
            if (!session || session.role !== 'admin') throw new Error("Unauthorized");
        }

        const setting = await prisma.seoSetting.findUnique({
            where: { key: 'google_service_account_json' }
        });

        if (!setting || !setting.value) {
            throw new Error("Google Service Account JSON not configured.");
        }

        let keyData;
        try {
            keyData = JSON.parse(setting.value);
        } catch (e) {
            throw new Error("Invalid Google Service Account JSON format.");
        }

        const jwtClient = new google.auth.JWT(
            keyData.client_email,
            undefined,
            keyData.private_key,
            ["https://www.googleapis.com/auth/indexing"],
            undefined
        );

        await jwtClient.authorize();

        const indexing = google.indexing({ version: "v3", auth: jwtClient });

        const res = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: "URL_UPDATED"
            }
        });

        if (res.status === 200) {
            return { success: true, message: "URL submitted to Google Indexing API successfully." };
        } else {
            throw new Error(`Google API Error: ${res.statusText}`);
        }

    } catch (error: any) {
        console.error("Google Indexing API Error:", error);
        return { success: false, message: "Google Indexing API submission failed.", error: error.message };
    }
}

/**
 * Automatically notify all enabled indexing services
 */
export async function autoNotifyIndexing(url: string) {
    try {
        const settings = await prisma.seoSetting.findMany({
            where: { key: { in: ['google_indexing_enabled', 'indexnow_enabled'] } }
        });

        const isGoogleEnabled = settings.find(s => s.key === 'google_indexing_enabled')?.value === 'true';
        const isIndexNowEnabled = settings.find(s => s.key === 'indexnow_enabled')?.value === 'true';

        const results = [];

        if (isGoogleEnabled) {
            results.push(submitToGoogleIndexing(url, true));
        }

        if (isIndexNowEnabled) {
            results.push(submitToIndexNow(url, true));
        }

        if (results.length > 0) {
            const final = await Promise.all(results);
            console.log("Auto Indexing Results:", final);
        }

    } catch (error) {
        console.error("Auto Notify Indexing General Error:", error);
    }
}
