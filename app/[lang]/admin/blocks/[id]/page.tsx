"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditBlockPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const [lang, setLang] = useState("");
    const [id, setId] = useState("");
    const router = useRouter();

    useEffect(() => {
        params.then((p) => {
            setLang(p.lang);
            setId(p.id);
        });
    }, [params]);

    const [block, setBlock] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/blocks/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setBlock(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this block?")) return;

        const res = await fetch(`/api/blocks/${id}`, { method: "DELETE" });
        if (res.ok) {
            router.push(`/${lang}/admin/blocks`);
        }
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data: any = {
            adminLabel: formData.get("adminLabel"),
            title: formData.get("title"),
            type: formData.get("type"),
            identifier: formData.get("identifier"),
            placement: formData.get("placement"),
            order: parseInt(formData.get("order") as string) || 0,
            isActive: formData.get("isActive") === "on",
        };

        // Content is already JSON string from the block
        data.content = block.content;

        const res = await fetch(`/api/blocks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            alert("Block updated successfully!");
        }
    }

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!block) return <div className="text-center py-12">Block not found</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${lang}/admin/blocks`}
                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Block</h1>
                        <p className="text-sm text-muted-foreground mt-1">{block.adminLabel}</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>

            <form onSubmit={handleUpdate} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Admin Label</label>
                    <input
                        type="text"
                        name="adminLabel"
                        defaultValue={block.adminLabel}
                        required
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Public Title</label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={block.title || ""}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Type</label>
                    <select
                        name="type"
                        defaultValue={block.type}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="faq">FAQ / Accordion</option>
                        <option value="rich_text">Rich Text</option>
                        <option value="image_text">Image + Text</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Identifier</label>
                    <input
                        type="text"
                        name="identifier"
                        defaultValue={block.identifier}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                        Examples: prompts, scripts, category:photography, category:all
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Placement</label>
                    <select
                        name="placement"
                        defaultValue={block.placement}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Order</label>
                    <input
                        type="number"
                        name="order"
                        defaultValue={block.order}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold">Content (JSON)</label>
                    <textarea
                        value={block.content}
                        onChange={(e) => setBlock({ ...block, content: e.target.value })}
                        rows={10}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Edit the JSON content directly</p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked={block.isActive}
                        className="w-5 h-5"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold">Active</label>
                </div>

                <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </form>
        </div>
    );
}
