"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { generateFAQSchema } from "@/lib/block-schemas";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQBlockProps {
    title?: string;
    items: FAQItem[];
}

export function FAQBlock({ title, items }: FAQBlockProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const schema = title ? generateFAQSchema(title, items) : null;

    return (
        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 space-y-6">
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            )}

            {title && (
                <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            )}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="border border-border rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
                        >
                            <span className="font-bold text-lg">{item.question}</span>
                            <ChevronDown
                                className={`w-5 h-5 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openIndex === index && (
                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
