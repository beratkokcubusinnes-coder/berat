interface RichTextBlockProps {
    title?: string;
    content: string;
}

export function RichTextBlock({ title, content }: RichTextBlockProps) {
    return (
        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 space-y-6">
            {title && (
                <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            )}
            <div
                className="prose prose-invert max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </section>
    );
}
