"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserActionButtonsProps {
    user: any;
}

export function UserActionButtons({ user }: UserActionButtonsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = async (action: 'warn' | 'ban' | 'unban') => {
        setIsLoading(action);
        try {
            let response;
            if (action === 'warn') {
                response = await fetch("/api/users/warn", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id }),
                });
            } else {
                const formData = new FormData();
                formData.append("id", user.id);
                response = await fetch(`/api/users/${action}`, {
                    method: "POST",
                    body: formData,
                });
            }

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.message || `Failed to ${action} user`);
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <>
            <button
                onClick={() => handleAction('warn')}
                disabled={!!isLoading}
                className="p-2 hover:bg-yellow-500/10 rounded-lg transition-all disabled:opacity-50"
                title="Warn user"
            >
                {isLoading === 'warn' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
            </button>

            <button
                onClick={() => handleAction(user.banned ? 'unban' : 'ban')}
                disabled={!!isLoading}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 ${user.banned
                    ? 'hover:bg-green-500/10'
                    : 'hover:bg-red-500/10'
                    }`}
                title={user.banned ? "Unban user" : "Ban user"}
            >
                {isLoading === 'ban' || isLoading === 'unban' ? (
                    <Loader2 className={`w-4 h-4 animate-spin ${user.banned ? 'text-green-500' : 'text-red-500'}`} />
                ) : (
                    <Ban className={`w-4 h-4 ${user.banned ? 'text-green-500' : 'text-red-500'}`} />
                )}
            </button>
        </>
    );
}
