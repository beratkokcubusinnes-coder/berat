"use client";

import { CheckCircle2 } from "lucide-react";
import { generateHowToSchema } from "@/lib/block-schemas";

interface HowToStep {
    name: string;
    text: string;
    image?: string;
}

interface HowToBlockProps {
    title?: string;
    description?: string;
    steps: HowToStep[];
}

export function HowToBlock({ title, description, steps }: HowToBlockProps) {
    const schema = title ? generateHowToSchema(title, description || "", steps) : null;

    return (
        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 space-y-6">
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            )}

            {title && (
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground">{title}</h2>
                    {description && (
                        <p className="text-lg text-muted-foreground">{description}</p>
                    )}
                </div>
            )}

            <ol className="space-y-6">
                {steps.map((step, index) => (
                    <li key={index} className="flex gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                {step.name}
                            </h3>
                            <div
                                className="text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: step.text }}
                            />
                            {step.image && (
                                <img
                                    src={step.image}
                                    alt={step.name}
                                    className="rounded-xl mt-4 w-full max-w-md"
                                />
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
