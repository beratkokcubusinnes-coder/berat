"use client";

import { generateVideoSchema } from "@/lib/block-schemas";

interface VideoBlockProps {
    title?: string;
    description?: string;
    videoUrl: string; // YouTube, Vimeo, or direct URL
    thumbnailUrl?: string;
    uploadDate?: string;
}

export function VideoBlock({ title, description, videoUrl, thumbnailUrl, uploadDate }: VideoBlockProps) {
    // Extract video ID and platform
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be')
                ? url.split('youtu.be/')[1]?.split('?')[0]
                : url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return url;
    };

    const embedUrl = getEmbedUrl(videoUrl);
    const schema = title && thumbnailUrl ? generateVideoSchema(
        title,
        description || "",
        thumbnailUrl,
        uploadDate || new Date().toISOString(),
        videoUrl,
        embedUrl
    ) : null;

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

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                    src={embedUrl}
                    title={title || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        </section>
    );
}
