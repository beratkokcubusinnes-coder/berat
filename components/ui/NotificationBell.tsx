"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/actions/notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date;
}

export function NotificationBell({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (userId) {
            loadNotifications();
        }
    }, [userId]);

    const loadNotifications = async () => {
        if (!userId) return;

        const [notifs, count] = await Promise.all([
            getUserNotifications(userId, 10),
            getUnreadCount(userId)
        ]);

        setNotifications(notifs as Notification[]);
        setUnreadCount(count);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        if (!userId) return;
        await markAsRead(notificationId, userId);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        await markAllAsRead(userId);
        loadNotifications();
    };

    if (!userId) {
        return (
            <button className="p-2 hover:bg-muted rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-muted rounded-xl transition-colors relative"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer",
                                        !notif.isRead && "bg-primary/5"
                                    )}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif.id);
                                        if (notif.link) {
                                            window.location.href = notif.link;
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-sm">{notif.title}</h4>
                                                {!notif.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                                            <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {!notif.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.id);
                                                }}
                                                className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Check className="w-4 h-4 text-primary" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
