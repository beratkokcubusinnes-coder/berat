"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface BlockFormProps {
    lang: string;
}

export default function NewBlockPage({ params }: { params: Promise<{ lang: string }> }) {
    const [lang, setLang] = useState("");

    params.then((p) => setLang(p.lang));

    return lang ? <BlockForm lang={lang} /> : null;
}

function BlockForm({ lang }: BlockFormProps) {
    const router = useRouter();
    const [type, setType] = useState("faq");
    const [identifier, setIdentifier] = useState("prompts");
    const [placement, setPlacement] = useState("bottom");
    const [faqItems, setFaqItems] = useState([{ question: "", answer: "" }]);
    const [richText, setRichText] = useState("");
    const [imageText, setImageText] = useState({ content: "", imageUrl: "", imageAlt: "", imagePosition: "right" });

    async function createBlock(prevState: any, formData: FormData) {
        const adminLabel = formData.get("adminLabel") as string;
        const title = formData.get("title") as string;
        const order = parseInt(formData.get("order") as string) || 0;
        const isActive = formData.get("isActive") === "on";

        let content: any = {};

        if (type === "faq") {
            content = { items: faqItems.filter(item => item.question && item.answer) };
        } else if (type === "rich_text") {
            content = { content: richText };
        } else if (type === "image_text") {
            content = imageText;
        }

        const res = await fetch("/api/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                adminLabel,
                title,
                type,
                identifier,
                placement,
                order,
                content: JSON.stringify(content),
                isActive
            })
        });

        if (res.ok) {
            router.push(`/${lang}/admin/blocks`);
            return { success: true };
        }

        return { success: false, error: "Failed to create block" };
    }

    const [state, formAction, pending] = useActionState(createBlock, null);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href={`/${lang}/admin/blocks`}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Add New Block</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create a new dynamic content block</p>
                </div>
            </div>

            <form action={formAction} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
                {/* Admin Label */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Admin Label *</label>
                    <input
                        type="text"
                        name="adminLabel"
                        required
                        placeholder="e.g., Homepage FAQ"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Public Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Public Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g., Frequently Asked Questions"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Optional. Shown to users.</p>
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Block Type *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="faq">📋 FAQ / Accordion (with Schema)</option>
                        <option value="rich_text">📝 Rich Text</option>
                        <option value="image_text">🖼️ Image + Text (with ImageObject)</option>
                        <option value="how_to">✅ How-To Guide (with Schema)</option>
                        <option value="video">🎥 Video Embed (with Schema)</option>
                        <option value="stats">📊 Stats / Numbers</option>
                        <option value="cta">🚀 Call-to-Action</option>
                        <option value="review">⭐ Reviews / Ratings (with Schema)</option>
                    </select>
                </div>

                {/* Identifier */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Page Identifier *</label>
                    <select
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="prompts">Prompts Page</option>
                        <option value="scripts">Scripts Page</option>
                        <option value="hooks">Hooks Page</option>
                        <option value="tools">Tools Page</option>
                        <option value="blog">Blog Page</option>
                        <option value="community">Community Page</option>
                        <option value="category:all">All Category Pages</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Or enter custom like: category:photography</p>
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Custom identifier"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                    />
                </div>

                {/* Placement */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Placement *</label>
                    <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="top">Top (above main content)</option>
                        <option value="bottom">Bottom (below main content)</option>
                    </select>
                </div>

                {/* Order */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold">Order</label>
                    <input
                        type="number"
                        name="order"
                        defaultValue={0}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
                </div>

                {/* Dynamic Content Fields */}
                {type === "faq" && (
                    <div className="space-y-4">
                        <label className="block text-sm font-bold">FAQ Items</label>
                        {faqItems.map((item, idx) => (
                            <div key={idx} className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                <input
                                    type="text"
                                    placeholder="Question"
                                    value={item.question}
                                    onChange={(e) => {
                                        const newItems = [...faqItems];
                                        newItems[idx].question = e.target.value;
                                        setFaqItems(newItems);
                                    }}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <textarea
                                    placeholder="Answer (HTML allowed)"
                                    value={item.answer}
                                    onChange={(e) => {
                                        const newItems = [...faqItems];
                                        newItems[idx].answer = e.target.value;
                                        setFaqItems(newItems);
                                    }}
                                    rows={3}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                            className="text-sm text-primary font-bold"
                        >
                            + Add Item
                        </button>
                    </div>
                )}

                {type === "rich_text" && (
                    <div className="space-y-2">
                        <label className="block text-sm font-bold">HTML Content</label>
                        <textarea
                            value={richText}
                            onChange={(e) => setRichText(e.target.value)}
                            rows={8}
                            placeholder="<p>Your content here...</p>"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        />
                    </div>
                )}

                {type === "image_text" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Image URL</label>
                            <input
                                type="text"
                                value={imageText.imageUrl}
                                onChange={(e) => setImageText({ ...imageText, imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Image Alt Text</label>
                            <input
                                type="text"
                                value={imageText.imageAlt}
                                onChange={(e) => setImageText({ ...imageText, imageAlt: e.target.value })}
                                placeholder="Description"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Image Position</label>
                            <select
                                value={imageText.imagePosition}
                                onChange={(e) => setImageText({ ...imageText, imagePosition: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Text Content (HTML)</label>
                            <textarea
                                value={imageText.content}
                                onChange={(e) => setImageText({ ...imageText, content: e.target.value })}
                                rows={6}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Active */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked
                        className="w-5 h-5"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold">Active</label>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={pending}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {pending ? "Creating..." : "Create Block"}
                    </button>
                    {state?.error && (
                        <span className="text-sm text-red-500">{state.error}</span>
                    )}
                </div>
            </form>
        </div>
    );
}
