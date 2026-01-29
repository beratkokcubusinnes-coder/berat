"use client";

import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
    userId: string;
}

export function DeleteUserButton({ userId }: DeleteUserButtonProps) {
    const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        const formData = new FormData();
        formData.append("id", userId);

        try {
            const response = await fetch('/api/users/delete', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    return (
        <form onSubmit={handleDelete} className="inline">
            <button
                type="submit"
                className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete user"
            >
                <Trash2 className="w-4 h-4 text-red-500" />
            </button>
        </form>
    );
}
