"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserNotifications(userId: string, limit: number = 20) {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function getUnreadCount(userId: string) {
    try {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    } catch (error) {
        console.error("Error counting unread notifications:", error);
        return 0;
    }
}

export async function markAsRead(notificationId: string, userId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return { success: false };
    }
}

export async function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        const notification = await prisma.notification.create({
            data
        });
        revalidatePath('/notifications');
        return { success: true, notification };
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false };
    }
}

// Helper: Create welcome notification for new users
export async function createWelcomeNotification(userId: string) {
    return createNotification({
        userId,
        type: "WELCOME",
        title: "Welcome to Promptda!",
        message: "Start exploring premium AI prompts and join our community."
    });
}
