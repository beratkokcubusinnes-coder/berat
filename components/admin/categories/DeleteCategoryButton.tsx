"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteCategoryButton({ id }: { id: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click if wrapped
        if (!confirm("Are you sure you want to delete this category?")) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/categories/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (res.ok) {
                router.refresh();
            } else {
                alert(data.message || "Failed to delete");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4 text-red-500" />
            )}
        </button>
    );
}
