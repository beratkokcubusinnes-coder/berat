"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStaticPage(slug: string) {
    try {
        const page = await prisma.staticPage.findUnique({
            where: { slug }
        });
        return page;
    } catch (error) {
        console.error(`Error fetching page ${slug}:`, error);
        return null;
    }
}

export async function getAllStaticPages() {
    try {
        return await prisma.staticPage.findMany({
            orderBy: { slug: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
    }
}

export async function updateStaticPage(slug: string, data: {
    title: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    isActive?: boolean;
}) {
    try {
        const page = await prisma.staticPage.upsert({
            where: { slug },
            update: {
                title: data.title,
                content: data.content,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                isActive: data.isActive
            },
            create: {
                slug,
                title: data.title,
                content: data.content,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                isActive: data.isActive ?? true
            }
        });
        
        revalidatePath(`/[lang]/${slug}`, 'page');
        return { success: true, page };
    } catch (error) {
        console.error(`Error updating page ${slug}:`, error);
        return { success: false, error: "Failed to update page" };
    }
}
