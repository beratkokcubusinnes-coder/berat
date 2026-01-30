import Image from "next/image";
import { generateImageObjectSchema } from "@/lib/block-schemas";

interface ImageTextBlockProps {
    title?: string;
    content: string;
    imageUrl: string;
    imageAlt?: string;
    imagePosition?: 'left' | 'right';
}

export function ImageTextBlock({
    title,
    content,
    imageUrl,
    imageAlt = "Image",
    imagePosition = 'right'
}: ImageTextBlockProps) {
    const imageSchema = generateImageObjectSchema(imageUrl, imageAlt);

    return (
        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
            />

            {title && (
                <h2 className="text-3xl font-bold text-foreground mb-8">{title}</h2>
            )}
            <div className={`grid md:grid-cols-2 gap-8 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''
                }`}>
                <div className={imagePosition === 'left' ? 'md:order-2' : ''}>
                    <div
                        className="prose prose-invert max-w-none text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
                <div className={`relative aspect-video rounded-2xl overflow-hidden ${imagePosition === 'left' ? 'md:order-1' : ''
                    }`}>
                    <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>
        </section>
    );
}
