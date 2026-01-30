"use client";

import { cn } from "@/lib/utils";

interface Block {
    id: string;
    type: "paragraph" | "h1" | "h2" | "h3" | "faq" | "howto" | "table" | "video" | "review" | "image" | "gallery" | "quote" | "code" | "list" | "divider" | "callout";
    content: any;
}

interface BlockRendererProps {
    content: string; // JSON stringified block array
    className?: string;
}

export function BlockRenderer({ content, className }: BlockRendererProps) {
    if (!content) return null;

    let blocks: Block[] = [];

    try {
        // Check if content is JSON blocks
        if (content.startsWith('[{"id"')) {
            blocks = JSON.parse(content);
        } else {
            // Fallback to raw HTML
            return (
                <div
                    className={cn("prose prose-invert max-w-none", className)}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }
    } catch (e) {
        // If parsing fails, render as HTML
        return (
            <div
                className={cn("prose prose-invert max-w-none", className)}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    // Generate SEO Schemas from blocks
    const generateSchemas = () => {
        const schemas: any[] = [];

        // FAQ Schema
        const faqBlocks = blocks.filter(b => b.type === "faq" && b.content.items && b.content.items.length > 0);
        if (faqBlocks.length > 0) {
            const allQuestions = faqBlocks.flatMap(block =>
                block.content.items
                    .filter((item: any) => item.question && item.answer)
                    .map((item: any) => ({
                        "@type": "Question",
                        "name": item.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item.answer
                        }
                    }))
            );

            if (allQuestions.length > 0) {
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": allQuestions
                });
            }
        }

        // HowTo Schema
        const howtoBlocks = blocks.filter(b => b.type === "howto" && b.content.steps && b.content.steps.length > 0);
        howtoBlocks.forEach(block => {
            const validSteps = block.content.steps.filter((step: any) => step.title && step.text);
            if (validSteps.length > 0) {
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "HowTo",
                    "name": block.content.name || "Guide",
                    "step": validSteps.map((step: any, i: number) => ({
                        "@type": "HowToStep",
                        "position": i + 1,
                        "name": step.title,
                        "text": step.text
                    }))
                });
            }
        });

        // Review Schema
        const reviewBlocks = blocks.filter(b => b.type === "review" && b.content.itemName && b.content.rating);
        reviewBlocks.forEach(block => {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "Review",
                "itemReviewed": {
                    "@type": "Thing",
                    "name": block.content.itemName
                },
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": block.content.rating,
                    "bestRating": 5
                },
                "author": {
                    "@type": "Person",
                    "name": block.content.author || "Anonymous"
                },
                "reviewBody": block.content.text || ""
            });
        });

        // Video Schema
        const videoBlocks = blocks.filter(b => b.type === "video" && b.content);
        videoBlocks.forEach(block => {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": "Tutorial Video",
                "embedUrl": `https://www.youtube.com/embed/${block.content}`,
                "thumbnailUrl": `https://img.youtube.com/vi/${block.content}/maxresdefault.jpg`,
                "uploadDate": new Date().toISOString()
            });
        });

        return schemas;
    };

    const schemas = generateSchemas();

    return (
        <div className={cn("block-renderer space-y-6", className)}>
            {/* Inject JSON-LD Schemas */}
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            {/* Render Blocks */}
            {blocks.map((block) => {
                switch (block.type) {
                    case "paragraph":
                        return (
                            <p key={block.id} className="text-sm leading-relaxed text-foreground/90">
                                {block.content}
                            </p>
                        );

                    case "h1":
                        return (
                            <h1 key={block.id} className="text-4xl font-black tracking-tight mt-10 mb-6">
                                {block.content}
                            </h1>
                        );

                    case "h2":
                        return (
                            <h2 key={block.id} className="text-3xl font-black tracking-tight mt-8 mb-4">
                                {block.content}
                            </h2>
                        );

                    case "h3":
                        return (
                            <h3 key={block.id} className="text-2xl font-black tracking-tight mt-6 mb-3">
                                {block.content}
                            </h3>
                        );

                    case "faq":
                        return (
                            <div key={block.id} className="space-y-4 my-8">
                                {(block.content.items || []).map((item: any, i: number) => (
                                    <div key={i} className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-[10px] font-black text-purple-400">Q</span>
                                            </div>
                                            <p className="text-sm font-bold text-foreground">{item.question}</p>
                                        </div>
                                        <div className="flex items-start gap-3 ml-9">
                                            <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                    case "howto":
                        return (
                            <div key={block.id} className="my-8 space-y-4">
                                {block.content.name && (
                                    <h3 className="text-xl font-black text-emerald-400 mb-4">{block.content.name}</h3>
                                )}
                                {(block.content.steps || []).map((step: any, i: number) => (
                                    <div key={i} className="bg-emerald-500/5 border-l-4 border-emerald-500/50 rounded-xl p-5 space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-emerald-400">STEP {i + 1}</span>
                                        </div>
                                        <p className="text-sm font-bold text-emerald-400">{step.title}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        );

                    case "table":
                        return (
                            <div key={block.id} className="overflow-x-auto rounded-2xl border border-border my-6">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            {block.content.headers.map((h: string, i: number) => (
                                                <th key={i} className="p-3 border-r border-border text-left font-black uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {block.content.rows.map((row: string[], ri: number) => (
                                            <tr key={ri} className="border-t border-border">
                                                {row.map((cell: string, ci: number) => (
                                                    <td key={ci} className="p-3 border-r border-border">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );

                    case "video":
                        return (
                            <div key={block.id} className="aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl my-8">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${block.content}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        );

                    case "review":
                        return (
                            <div key={block.id} className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 space-y-3 my-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black">{block.content.itemName}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg
                                                    key={star}
                                                    className={cn(
                                                        "w-4 h-4",
                                                        star <= (block.content.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-muted-foreground/20 text-muted-foreground/20"
                                                    )}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-yellow-400">{block.content.rating}/5</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground italic leading-relaxed">{block.content.text}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">— {block.content.author}</p>
                            </div>
                        );

                    case "image":
                        return (
                            <div key={block.id} className="my-8 space-y-3 animate-in fade-in duration-700">
                                <div className="relative group rounded-3xl overflow-hidden border border-border bg-black/40 shadow-2xl">
                                    <img
                                        src={block.content.url}
                                        alt={block.content.alt || ""}
                                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                                {block.content.caption && (
                                    <p className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-4">
                                        {block.content.caption}
                                    </p>
                                )}
                            </div>
                        );

                    case "gallery":
                        return (
                            <div key={block.id} className="my-10 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(block.content.items || []).map((item: any, i: number) => (
                                        <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-primary/20 transition-all duration-500">
                                            <img
                                                src={item.url}
                                                alt={item.caption || "Gallery image"}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {item.caption && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider line-clamp-2">
                                                        {item.caption}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                    case "quote":
                        return (
                            <div key={block.id} className="my-10 relative px-8 py-6 rounded-3xl bg-card/30 border border-border/50">
                                <div className="absolute top-0 left-8 -translate-y-1/2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 7.89543 10.9124 7 12.017 7H19.017C20.1216 7 21.017 7.89543 21.017 9V15C21.017 17.7614 18.7784 20 16.017 20H14.017V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56929 13 4.017 13H2.017C1.46472 13 1.017 12.5523 1.017 12V9C1.017 7.89543 1.91243 7 3.017 7H10.017C11.1216 7 12.017 7.89543 12.017 9V15C12.017 17.7614 9.77843 20 7.017 20H5.017V21Z" />
                                    </svg>
                                </div>
                                <blockquote className="text-xl md:text-2xl font-medium italic text-foreground leading-relaxed">
                                    "{block.content.text}"
                                </blockquote>
                                {block.content.author && (
                                    <cite className="block mt-4 text-sm font-black text-primary uppercase tracking-widest not-italic">
                                        — {block.content.author}
                                    </cite>
                                )}
                            </div>
                        );

                    case "code":
                        return (
                            <div key={block.id} className="my-8 rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
                                <div className="bg-muted/30 px-5 py-3 border-b border-border/50 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {block.content.lang || "Code"}
                                    </span>
                                </div>
                                <pre className="p-6 text-sm font-mono overflow-x-auto text-pink-300 leading-relaxed scrollbar-hide">
                                    <code>{block.content.code}</code>
                                </pre>
                            </div>
                        );

                    case "list":
                        return (
                            <div key={block.id} className="my-6 space-y-3">
                                {(block.content.items || []).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                        <div className="mt-1.5 shrink-0 flex items-center justify-center">
                                            {block.content.style === "numbered" ? (
                                                <span className="text-[10px] font-black text-primary w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">{i + 1}</span>
                                            ) : block.content.style === "check" ? (
                                                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        );

                    case "callout":
                        return (
                            <div key={block.id} className={cn(
                                "my-8 p-6 rounded-3xl border flex gap-5",
                                block.content.type === "warning" ? "bg-orange-500/[0.03] border-orange-500/20" :
                                    block.content.type === "success" ? "bg-emerald-500/[0.03] border-emerald-500/20" :
                                        "bg-primary/[0.03] border-primary/20"
                            )}>
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20",
                                    block.content.type === "warning" ? "bg-orange-500/20 text-orange-500" :
                                        block.content.type === "success" ? "bg-emerald-500/20 text-emerald-500" :
                                            "bg-primary/20 text-primary"
                                )}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        block.content.type === "warning" ? "text-orange-500" :
                                            block.content.type === "success" ? "text-emerald-500" :
                                                "text-primary"
                                    )}>
                                        {block.content.type === "warning" ? "Caution" : block.content.type === "success" ? "Pro Tip" : "Note"}
                                    </span>
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {block.content.text}
                                    </p>
                                </div>
                            </div>
                        );

                    case "divider":
                        return (
                            <div key={block.id} className="my-12 flex items-center justify-center gap-6">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                                <div className="w-2 h-2 rounded-full bg-border" />
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                            </div>
                        );

                    default:
                        return null;
                }
            })}

            <style jsx global>{`
                .block-renderer {
                    line-height: 1.7;
                }
                .block-renderer table {
                    border-collapse: collapse;
                }
                .block-renderer td,
                .block-renderer th {
                    text-align: left;
                }
            `}</style>
        </div>
    );
}
