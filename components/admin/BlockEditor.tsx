"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Type, Heading1, Heading2, Heading3, HelpCircle, ListTree, Table as TableIcon, Youtube, Quote, Star, Image as ImageIcon, Code, Minus, List, AlertCircle, Terminal, CheckCircle2, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premium Block-Based Editor (Enhanced)
 * With multi-item FAQ, HowTo, dynamic tables, and Review support
 */

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "faq" | "howto" | "table" | "video" | "review" | "image" | "gallery" | "quote" | "code" | "list" | "divider" | "callout";

interface Block {
    id: string;
    type: BlockType;
    content: any;
}

interface BlockEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function BlockEditor({ value, onChange, placeholder }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            if (value && value.startsWith('[{"id"')) {
                try {
                    setBlocks(JSON.parse(value));
                } catch (e) {
                    setBlocks([{ id: "initial", type: "paragraph", content: "" }]);
                }
            } else if (value) {
                setBlocks([{ id: "initial", type: "paragraph", content: value }]);
            } else {
                setBlocks([{ id: Math.random().toString(36).substr(2, 9), type: "paragraph", content: "" }]);
            }
            isFirstRender.current = false;
        }
    }, [value]);

    useEffect(() => {
        if (!isFirstRender.current) {
            onChange(JSON.stringify(blocks));
        }
    }, [blocks, onChange]);

    const addBlock = (type: BlockType, afterBlockId?: string) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === "table" ? { headers: ["Column 1", "Column 2"], rows: [["", ""]] } :
                type === "faq" ? { items: [{ question: "", answer: "" }] } :
                    type === "howto" ? { name: "", steps: [{ title: "", text: "" }] } :
                        type === "image" ? { url: "", alt: "", caption: "" } :
                            type === "gallery" ? { items: [{ url: "", caption: "" }] } :
                                type === "quote" ? { text: "", author: "" } :
                                    type === "code" ? { lang: "javascript", code: "" } :
                                        type === "list" ? { style: "bullet", items: [""] } :
                                            type === "callout" ? { type: "info", text: "" } :
                                                type === "divider" ? "" :
                                                    type === "review" ? { itemName: "", rating: 5, author: "", text: "" } : ""
        };

        if (afterBlockId) {
            const index = blocks.findIndex(b => b.id === afterBlockId);
            if (index !== -1) {
                const newBlocks = [...blocks];
                newBlocks.splice(index + 1, 0, newBlock);
                setBlocks(newBlocks);
                setActiveBlock(newBlock.id);
                return;
            }
        }

        setBlocks([...blocks, newBlock]);
        setActiveBlock(newBlock.id);
    };

    const updateBlock = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.url) {
                const currentBlock = blocks.find(b => b.id === blockId);
                if (currentBlock) {
                    updateBlock(blockId, { ...currentBlock.content, url: data.url });
                }
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        }
    };

    const deleteBlock = (id: string) => {
        if (blocks.length === 1) {
            setBlocks([{ id: Math.random().toString(36).substr(2, 9), type: "paragraph", content: "" }]);
            return;
        }
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
            setBlocks(newBlocks);
        } else if (direction === 'down' && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            setBlocks(newBlocks);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, blockId: string) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBlock("paragraph", blockId);
        }

        if (e.key === 'Backspace') {
            const block = blocks.find(b => b.id === blockId);
            if (block && !block.content) {
                e.preventDefault();
                deleteBlock(blockId);
            }
        }
    };

    const openBlockMenu = (afterBlockId: string) => {
        setInsertAfterBlockId(afterBlockId);
        setShowBlockMenu(true);
    };

    const BlockTypeButton = ({ type, icon: Icon, label, color }: { type: BlockType, icon: any, label: string, color: string }) => (
        <button
            type="button"
            onClick={() => {
                addBlock(type, insertAfterBlockId || undefined);
                setShowBlockMenu(false);
            }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-all w-full text-left group border border-transparent hover:border-border",
                color
            )}
        >
            <div className={cn("p-2 rounded-lg bg-opacity-10", color)}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">{label}</span>
        </button>
    );

    return (
        <div className="block-editor-container space-y-4">
            {/* Block Menu Modal */}
            {showBlockMenu && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowBlockMenu(false)}>
                    <div className="bg-card border border-border rounded-3xl p-6 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-black mb-4">Add Content Block</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <BlockTypeButton type="paragraph" icon={Type} label="Paragraph" color="text-gray-400" />
                            <BlockTypeButton type="h1" icon={Heading1} label="H1 Title" color="text-blue-400" />
                            <BlockTypeButton type="h2" icon={Heading2} label="H2 Title" color="text-blue-400" />
                            <BlockTypeButton type="h3" icon={Heading3} label="H3 Title" color="text-blue-400" />
                            <BlockTypeButton type="image" icon={ImageIcon} label="Image" color="text-indigo-400" />
                            <BlockTypeButton type="gallery" icon={Layout} label="Gallery" color="text-cyan-400" />
                            <BlockTypeButton type="quote" icon={Quote} label="Quote" color="text-slate-400" />
                            <BlockTypeButton type="list" icon={List} label="Bullet List" color="text-teal-400" />
                            <BlockTypeButton type="code" icon={Terminal} label="Code Block" color="text-pink-400" />
                            <BlockTypeButton type="callout" icon={AlertCircle} label="Callout Box" color="text-amber-400" />
                            <BlockTypeButton type="faq" icon={HelpCircle} label="FAQ (SEO)" color="text-purple-400" />
                            <BlockTypeButton type="howto" icon={ListTree} label="How-To" color="text-emerald-400" />
                            <BlockTypeButton type="table" icon={TableIcon} label="Data Table" color="text-orange-400" />
                            <BlockTypeButton type="video" icon={Youtube} label="Video" color="text-red-400" />
                            <BlockTypeButton type="review" icon={Star} label="Review" color="text-yellow-400" />
                            <BlockTypeButton type="divider" icon={Minus} label="Divider" color="text-gray-500" />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        className={cn(
                            "group relative flex gap-3 p-4 rounded-3xl border transition-all duration-300",
                            activeBlock === block.id ? "bg-card border-primary/50 shadow-xl shadow-primary/5" : "bg-card/40 border-border hover:border-border/80"
                        )}
                        onClick={() => setActiveBlock(block.id)}
                    >
                        {/* Block Controls */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-20 transition-all"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button type="button" className="p-1.5 cursor-grab text-muted-foreground/30 hover:text-foreground">
                                <GripVertical className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={index === blocks.length - 1}
                                className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-20 transition-all"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="h-px bg-border/50 my-1" />
                            <button
                                type="button"
                                onClick={() => deleteBlock(block.id)}
                                className="p-1.5 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Block Content */}
                        <div className="flex-1 min-w-0">
                            {/* Block Type Indicator */}
                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                {block.type === "paragraph" && <Type className="w-3 h-3" />}
                                {block.type === "h1" && <Heading1 className="w-3 h-3 text-blue-500" />}
                                {block.type === "h2" && <Heading2 className="w-3 h-3 text-blue-500" />}
                                {block.type === "h3" && <Heading3 className="w-3 h-3 text-blue-500" />}
                                {block.type === "image" && <ImageIcon className="w-3 h-3 text-indigo-500" />}
                                {block.type === "gallery" && <Layout className="w-3 h-3 text-cyan-500" />}
                                {block.type === "quote" && <Quote className="w-3 h-3 text-slate-500" />}
                                {block.type === "code" && <Terminal className="w-3 h-3 text-pink-500" />}
                                {block.type === "list" && <List className="w-3 h-3 text-teal-500" />}
                                {block.type === "callout" && <AlertCircle className="w-3 h-3 text-amber-500" />}
                                {block.type === "faq" && <HelpCircle className="w-3 h-3 text-purple-500" />}
                                {block.type === "howto" && <ListTree className="w-3 h-3 text-emerald-500" />}
                                {block.type === "table" && <TableIcon className="w-3 h-3 text-orange-500" />}
                                {block.type === "video" && <Youtube className="w-3 h-3 text-red-500" />}
                                {block.type === "review" && <Star className="w-3 h-3 text-yellow-500" />}
                                {block.type === "divider" && <Minus className="w-3 h-3 text-gray-500" />}
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {block.type}
                                </span>
                            </div>

                            {/* Paragraph */}
                            {block.type === "paragraph" && (
                                <div className="space-y-1">
                                    <textarea
                                        className="w-full bg-transparent border-0 focus:ring-0 text-sm font-medium leading-relaxed resize-none min-h-[40px] placeholder:text-muted-foreground/40 focus:outline-none"
                                        placeholder="Type something... (Press Enter for new block, use [text](url) for links)"
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, block.id)}
                                        rows={1}
                                        onInput={(e: any) => {
                                            e.target.style.height = 'inherit';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                    />
                                    {block.content?.includes('[') && (
                                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-40">Markdown Links supported</div>
                                    )}
                                </div>
                            )}

                            {/* Headings */}
                            {(block.type === "h1" || block.type === "h2" || block.type === "h3") && (
                                <input
                                    className={cn(
                                        "w-full bg-transparent border-0 focus:ring-0 font-black tracking-tight placeholder:text-muted-foreground/40 focus:outline-none",
                                        block.type === "h1" && "text-3xl",
                                        block.type === "h2" && "text-2xl",
                                        block.type === "h3" && "text-xl"
                                    )}
                                    placeholder={`${block.type.toUpperCase()} Heading...`}
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, block.id)}
                                />
                            )}

                            {/* FAQ - Multi Items */}
                            {block.type === "faq" && (
                                <div className="space-y-4 bg-purple-500/5 border border-purple-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="w-4 h-4 text-purple-400" />
                                            <span className="text-[10px] font-black uppercase text-purple-400">SEO FAQ Block</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(block.content.items || []), { question: "", answer: "" }];
                                                updateBlock(block.id, { items: newItems });
                                            }}
                                            className="text-[10px] font-black uppercase text-purple-400 hover:text-purple-300 px-3 py-1 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-all"
                                        >
                                            + Add Q&A
                                        </button>
                                    </div>
                                    {(block.content.items || []).map((item: any, i: number) => (
                                        <div key={i} className="space-y-2 p-4 bg-black/10 rounded-xl relative group/item">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = block.content.items.filter((_: any, idx: number) => idx !== i);
                                                    updateBlock(block.id, { items: newItems });
                                                }}
                                                className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 text-[10px] text-red-400 hover:text-red-300 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <input
                                                className="w-full bg-transparent border-b border-purple-500/20 py-2 text-sm font-bold focus:border-purple-500 outline-none pr-8"
                                                placeholder={`Question ${i + 1}?`}
                                                value={item.question}
                                                onChange={(e) => {
                                                    const newItems = [...block.content.items];
                                                    newItems[i].question = e.target.value;
                                                    updateBlock(block.id, { items: newItems });
                                                }}
                                            />
                                            <textarea
                                                className="w-full bg-transparent py-2 text-xs text-muted-foreground focus:ring-0 resize-none outline-none"
                                                placeholder="Detailed answer..."
                                                value={item.answer}
                                                onChange={(e) => {
                                                    const newItems = [...block.content.items];
                                                    newItems[i].answer = e.target.value;
                                                    updateBlock(block.id, { items: newItems });
                                                }}
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* How-To - Multi Steps (Enhanced with Nesting) */}
                            {block.type === "howto" && (
                                <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <ListTree className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase text-emerald-400">SEO How-To Guide</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSteps = [...(block.content.steps || []), { title: "", text: "", blocks: [] }];
                                                updateBlock(block.id, { ...block.content, steps: newSteps });
                                            }}
                                            className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all"
                                        >
                                            + Add Step
                                        </button>
                                    </div>
                                    <input
                                        className="w-full bg-transparent border-b border-emerald-500/30 py-2 text-base font-black focus:border-emerald-500 outline-none"
                                        placeholder="Guide Title (e.g., How to Use This Prompt)"
                                        value={block.content.name || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, name: e.target.value })}
                                    />
                                    {(block.content.steps || []).map((step: any, i: number) => (
                                        <div key={i} className="space-y-4 p-4 bg-black/10 rounded-xl border-l-4 border-emerald-500/30 relative group/step">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Step {i + 1}</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSteps = [...block.content.steps];
                                                            const hasBlocks = newSteps[i].blocks && newSteps[i].blocks.length > 0;
                                                            if (!hasBlocks) {
                                                                newSteps[i].blocks = [{ id: Math.random().toString(36).substr(2, 9), type: "paragraph", content: newSteps[i].text || "" }];
                                                            } else {
                                                                newSteps[i].text = (newSteps[i].blocks || []).map((b: any) => typeof b.content === 'string' ? b.content : '').join(' ');
                                                                newSteps[i].blocks = [];
                                                            }
                                                            updateBlock(block.id, { ...block.content, steps: newSteps });
                                                        }}
                                                        className="text-[9px] font-black uppercase text-emerald-400 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                                                    >
                                                        {step.blocks && step.blocks.length > 0 ? "Switch to Text" : "Rich Content"}
                                                        <Layout className="w-2.5 h-2.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSteps = block.content.steps.filter((_: any, idx: number) => idx !== i);
                                                            updateBlock(block.id, { ...block.content, steps: newSteps });
                                                        }}
                                                        className="opacity-0 group-hover/step:opacity-100 text-[10px] text-red-400 hover:text-red-300 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                className="w-full bg-transparent border-b border-emerald-500/20 py-2 text-sm font-bold focus:border-emerald-500 outline-none"
                                                placeholder="Step heading..."
                                                value={step.title}
                                                onChange={(e) => {
                                                    const newSteps = [...block.content.steps];
                                                    newSteps[i].title = e.target.value;
                                                    updateBlock(block.id, { ...block.content, steps: newSteps });
                                                }}
                                            />

                                            {/* Nesting Logic */}
                                            {step.blocks && step.blocks.length > 0 ? (
                                                <div className="p-4 bg-black/20 rounded-2xl border border-dashed border-emerald-500/20">
                                                    <BlockEditor
                                                        value={JSON.stringify(step.blocks)}
                                                        onChange={(newVal) => {
                                                            const newSteps = [...block.content.steps];
                                                            try {
                                                                newSteps[i].blocks = JSON.parse(newVal);
                                                                updateBlock(block.id, { ...block.content, steps: newSteps });
                                                            } catch (e) { }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <textarea
                                                    className="w-full bg-transparent py-2 text-xs text-muted-foreground focus:ring-0 resize-none outline-none"
                                                    placeholder="Step instruction..."
                                                    value={step.text}
                                                    onChange={(e) => {
                                                        const newSteps = [...block.content.steps];
                                                        newSteps[i].text = e.target.value;
                                                        updateBlock(block.id, { ...block.content, steps: newSteps });
                                                    }}
                                                    rows={2}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Table - Dynamic Rows & Columns */}
                            {block.type === "table" && (
                                <div className="overflow-hidden rounded-2xl border border-border">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50 font-black">
                                            <tr>
                                                {block.content.headers.map((h: string, i: number) => (
                                                    <th key={i} className="p-3 border-r border-border relative group/header">
                                                        <input
                                                            className="bg-transparent border-0 focus:ring-0 w-full font-black text-center pr-6"
                                                            value={h}
                                                            onChange={(e) => {
                                                                const newHeaders = [...block.content.headers];
                                                                newHeaders[i] = e.target.value;
                                                                updateBlock(block.id, { ...block.content, headers: newHeaders });
                                                            }}
                                                        />
                                                        {block.content.headers.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newHeaders = block.content.headers.filter((_: any, idx: number) => idx !== i);
                                                                    const newRows = block.content.rows.map((row: string[]) =>
                                                                        row.filter((_: any, idx: number) => idx !== i)
                                                                    );
                                                                    updateBlock(block.id, { headers: newHeaders, rows: newRows });
                                                                }}
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/header:opacity-100 text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {block.content.rows.map((row: string[], ri: number) => (
                                                <tr key={ri} className="border-t border-border group/row">
                                                    {row.map((cell: string, ci: number) => (
                                                        <td key={ci} className="p-3 border-r border-border">
                                                            <input
                                                                className="bg-transparent border-0 focus:ring-0 w-full"
                                                                value={cell}
                                                                onChange={(e) => {
                                                                    const newRows = [...block.content.rows];
                                                                    newRows[ri][ci] = e.target.value;
                                                                    updateBlock(block.id, { ...block.content, rows: newRows });
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="p-2 w-12">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newRows = block.content.rows.filter((_: any, idx: number) => idx !== ri);
                                                                if (newRows.length === 0) newRows.push(Array(block.content.headers.length).fill(""));
                                                                updateBlock(block.id, { ...block.content, rows: newRows });
                                                            }}
                                                            className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-300 transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 bg-muted/20 flex gap-2">
                                        <button type="button" onClick={() => {
                                            const newRows = [...block.content.rows, Array(block.content.headers.length).fill("")];
                                            updateBlock(block.id, { ...block.content, rows: newRows });
                                        }} className="text-[10px] font-black uppercase text-orange-500 hover:underline px-2 py-1">+ Row</button>
                                        <button type="button" onClick={() => {
                                            const newHeaders = [...block.content.headers, `Column ${block.content.headers.length + 1}`];
                                            const newRows = block.content.rows.map((row: string[]) => [...row, ""]);
                                            updateBlock(block.id, { headers: newHeaders, rows: newRows });
                                        }} className="text-[10px] font-black uppercase text-orange-500 hover:underline px-2 py-1">+ Column</button>
                                    </div>
                                </div>
                            )}

                            {/* Video */}
                            {block.type === "video" && (
                                <div className="space-y-3 bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    <input
                                        className="w-full bg-transparent border-b border-red-500/20 py-2 text-sm font-bold focus:border-red-500 outline-none"
                                        placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                    />
                                    {block.content && (
                                        <div className="aspect-video rounded-xl overflow-hidden border border-border">
                                            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${block.content}`} frameBorder="0" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Gallery Block */}
                            {block.type === "gallery" && (
                                <div className="space-y-4 bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Layout className="w-4 h-4 text-cyan-400" />
                                            <span className="text-[10px] font-black uppercase text-cyan-400">Image Gallery</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(block.content.items || []), { url: "", caption: "" }];
                                                updateBlock(block.id, { ...block.content, items: newItems });
                                            }}
                                            className="text-[10px] font-black uppercase text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-all"
                                        >
                                            + Add Image
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(block.content.items || []).map((item: any, i: number) => (
                                            <div key={i} className="space-y-2 p-3 bg-black/20 rounded-xl relative group/item">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newItems = block.content.items.filter((_: any, idx: number) => idx !== i);
                                                        updateBlock(block.id, { ...block.content, items: newItems });
                                                    }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-300 transition-all z-10"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <div className="aspect-video bg-black/50 rounded-lg overflow-hidden border border-border flex items-center justify-center relative">
                                                    {item.url ? (
                                                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
                                                    )}
                                                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition-all">
                                                        <span className="text-[10px] font-black uppercase text-white">Upload</span>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append("file", file);
                                                                try {
                                                                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                                    const data = await res.json();
                                                                    if (data.url) {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[i].url = data.url;
                                                                        updateBlock(block.id, { ...block.content, items: newItems });
                                                                    }
                                                                } catch (err) { console.error(err); }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <input
                                                    className="w-full bg-transparent border-b border-white/10 py-1 text-[10px] focus:border-cyan-500 outline-none"
                                                    placeholder="Caption (optional)"
                                                    value={item.caption || ""}
                                                    onChange={(e) => {
                                                        const newItems = [...block.content.items];
                                                        newItems[i].caption = e.target.value;
                                                        updateBlock(block.id, { ...block.content, items: newItems });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Block */}
                            {block.type === "image" && (
                                <div className="space-y-4 bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-black uppercase text-indigo-400">Image Asset</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            className="w-full bg-transparent border-b border-indigo-500/20 py-2 text-xs focus:border-indigo-500 outline-none"
                                            placeholder="Image URL (or upload...)"
                                            value={block.content.url || ""}
                                            onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                                        />
                                        <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap">
                                            Upload
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, block.id)}
                                            />
                                        </label>
                                    </div>
                                    {block.content.url && (
                                        <div className="relative group aspect-video rounded-xl overflow-hidden border border-border bg-black/50">
                                            <img src={block.content.url} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">Alt Text</label>
                                            <input
                                                className="w-full bg-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50"
                                                placeholder="SEO Alt text..."
                                                value={block.content.alt || ""}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">Caption</label>
                                            <input
                                                className="w-full bg-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50"
                                                placeholder="Public caption..."
                                                value={block.content.caption || ""}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quote Block */}
                            {block.type === "quote" && (
                                <div className="space-y-3 bg-slate-500/5 border-l-4 border-slate-500/30 p-5 rounded-r-2xl">
                                    <Quote className="w-5 h-5 text-slate-400 mb-2 opacity-50" />
                                    <textarea
                                        className="w-full bg-transparent border-0 focus:ring-0 text-lg font-medium italic leading-relaxed resize-none outline-none"
                                        placeholder="Enter inspirational quote or highlight..."
                                        value={block.content.text || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                                        rows={2}
                                    />
                                    <input
                                        className="w-full bg-transparent border-0 py-1 text-xs font-bold text-muted-foreground focus:ring-0 outline-none"
                                        placeholder="— Author / Source"
                                        value={block.content.author || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Review/Rating */}
                            {block.type === "review" && (
                                <div className="space-y-3 bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span className="text-[10px] font-black uppercase text-yellow-400">Review Schema</span>
                                    </div>
                                    <input
                                        className="w-full bg-transparent border-b border-yellow-500/20 py-2 text-sm font-bold focus:border-yellow-500 outline-none"
                                        placeholder="Item/Product Name"
                                        value={block.content.itemName || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, itemName: e.target.value })}
                                    />
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold">Rating:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => updateBlock(block.id, { ...block.content, rating: star })}
                                                    className="transition-all"
                                                >
                                                    <Star className={cn(
                                                        "w-5 h-5",
                                                        star <= (block.content.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                                    )} />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-yellow-400">{block.content.rating || 0}/5</span>
                                    </div>
                                    <input
                                        className="w-full bg-transparent border-b border-yellow-500/20 py-2 text-xs focus:border-yellow-500 outline-none"
                                        placeholder="Reviewer Name"
                                        value={block.content.author || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
                                    />
                                    <textarea
                                        className="w-full bg-transparent py-2 text-xs text-muted-foreground focus:ring-0 resize-none outline-none"
                                        placeholder="Review text..."
                                        value={block.content.text || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Code Block */}
                            {block.type === "code" && (
                                <div className="bg-slate-900 border border-border rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                            <Terminal className="w-3 h-3 text-pink-400 ml-2" />
                                            <select
                                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-muted-foreground border-none focus:ring-0 cursor-pointer hover:text-foreground"
                                                value={block.content.lang || "javascript"}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, lang: e.target.value })}
                                            >
                                                <option value="javascript">Javascript</option>
                                                <option value="typescript">Typescript</option>
                                                <option value="python">Python</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="bash">Bash/Shell</option>
                                                <option value="json">JSON</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        className="w-full bg-transparent p-6 text-sm font-mono text-pink-300 leading-relaxed resize-none focus:ring-0 focus:outline-none min-h-[120px]"
                                        placeholder="// Paste your code or prompt here..."
                                        value={block.content.code || ""}
                                        onChange={(e) => updateBlock(block.id, { ...block.content, code: e.target.value })}
                                        spellCheck={false}
                                    />
                                </div>
                            )}

                            {/* List Block */}
                            {block.type === "list" && (
                                <div className="space-y-4 bg-teal-500/5 border border-teal-500/10 p-5 rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <List className="w-4 h-4 text-teal-400" />
                                            <select
                                                className="bg-transparent text-[10px] font-black uppercase text-teal-400 border-none focus:ring-0"
                                                value={block.content.style || "bullet"}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, style: e.target.value })}
                                            >
                                                <option value="bullet">Bullet List</option>
                                                <option value="numbered">Numbered List</option>
                                                <option value="check">Checklist</option>
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(block.content.items || []), ""];
                                                updateBlock(block.id, { ...block.content, items: newItems });
                                            }}
                                            className="text-[10px] font-black uppercase text-teal-400 hover:text-teal-300 bg-teal-500/10 px-3 py-1 rounded-lg"
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(block.content.items || []).map((item: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 bg-black/10 p-2 rounded-xl group/listitem">
                                                <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                                                    {block.content.style === "numbered" ? (
                                                        <span className="text-[10px] font-bold text-teal-500">{i + 1}</span>
                                                    ) : block.content.style === "check" ? (
                                                        <CheckCircle2 className="w-3 h-3 text-teal-500" />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                                    )}
                                                </div>
                                                <input
                                                    className="flex-1 bg-transparent text-sm border-none focus:ring-0 outline-none"
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newItems = [...block.content.items];
                                                        newItems[i] = e.target.value;
                                                        updateBlock(block.id, { ...block.content, items: newItems });
                                                    }}
                                                    placeholder="Enter list item..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newItems = block.content.items.filter((_: any, idx: number) => idx !== i);
                                                        updateBlock(block.id, { ...block.content, items: newItems });
                                                    }}
                                                    className="text-red-400 hover:text-red-300 opacity-0 group-hover/listitem:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Callout Block */}
                            {block.type === "callout" && (
                                <div className={cn(
                                    "p-5 rounded-2xl flex gap-4 border",
                                    block.content.type === "warning" ? "bg-orange-500/5 border-orange-500/20" :
                                        block.content.type === "success" ? "bg-emerald-500/5 border-emerald-500/20" :
                                            "bg-blue-500/5 border-blue-500/20"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                        block.content.type === "warning" ? "bg-orange-500/20 text-orange-500" :
                                            block.content.type === "success" ? "bg-emerald-500/20 text-emerald-500" :
                                                "bg-blue-500/20 text-blue-500"
                                    )}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <select
                                                className="bg-transparent text-[10px] font-black uppercase text-foreground/50 border-none focus:ring-0 p-0"
                                                value={block.content.type || "info"}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, type: e.target.value })}
                                            >
                                                <option value="info">Info Notice</option>
                                                <option value="warning">Warning Notice</option>
                                                <option value="success">Success Notice</option>
                                            </select>
                                        </div>
                                        <textarea
                                            className="w-full bg-transparent border-none p-0 text-sm font-medium leading-relaxed focus:ring-0 resize-none outline-none"
                                            placeholder="Enter context or highlight text..."
                                            value={block.content.text || ""}
                                            onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Divider Block */}
                            {block.type === "divider" && (
                                <div className="py-8 flex items-center justify-center gap-4">
                                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <div className="h-px bg-gradient-to-r from-border via-border to-transparent flex-1" />
                                </div>
                            )}
                        </div>

                        {/* Quick Add Button */}
                        {activeBlock === block.id && (
                            <button
                                type="button"
                                onClick={() => openBlockMenu(block.id)}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {blocks.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors cursor-pointer" onClick={() => openBlockMenu(blocks[0]?.id)}>
                    <Plus className="w-8 h-8" />
                    <span className="text-xs font-black uppercase tracking-widest">Add Your First Block</span>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground/40 text-center font-bold uppercase tracking-[0.2em] pt-4">
                Enhanced Block Editor • Multi-item support • Dynamic tables
            </p>
        </div>
    );
}
