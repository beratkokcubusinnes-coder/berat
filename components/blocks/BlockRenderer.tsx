import { FAQBlock } from "./FAQBlock";
import { RichTextBlock } from "./RichTextBlock";
import { ImageTextBlock } from "./ImageTextBlock";
import { HowToBlock } from "./HowToBlock";
import { VideoBlock } from "./VideoBlock";
import { StatsBlock } from "./StatsBlock";
import { CTABlock } from "./CTABlock";
import { ReviewBlock } from "./ReviewBlock";

interface PageBlock {
    id: string;
    title?: string | null;
    type: string;
    content: string;
}

interface BlockRendererProps {
    blocks: PageBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="space-y-8">
            {blocks.map((block) => {
                try {
                    const contentData = JSON.parse(block.content);

                    switch (block.type) {
                        case 'faq':
                            return (
                                <FAQBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    items={contentData.items || []}
                                />
                            );

                        case 'rich_text':
                            return (
                                <RichTextBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    content={contentData.content || ''}
                                />
                            );

                        case 'image_text':
                            return (
                                <ImageTextBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    content={contentData.content || ''}
                                    imageUrl={contentData.imageUrl || ''}
                                    imageAlt={contentData.imageAlt}
                                    imagePosition={contentData.imagePosition}
                                />
                            );

                        case 'how_to':
                            return (
                                <HowToBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    description={contentData.description}
                                    steps={contentData.steps || []}
                                />
                            );

                        case 'video':
                            return (
                                <VideoBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    description={contentData.description}
                                    videoUrl={contentData.videoUrl || ''}
                                    thumbnailUrl={contentData.thumbnailUrl}
                                    uploadDate={contentData.uploadDate}
                                />
                            );

                        case 'stats':
                            return (
                                <StatsBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    stats={contentData.stats || []}
                                />
                            );

                        case 'cta':
                            return (
                                <CTABlock
                                    key={block.id}
                                    title={contentData.title || ''}
                                    description={contentData.description}
                                    buttonText={contentData.buttonText || 'Learn More'}
                                    buttonUrl={contentData.buttonUrl || '#'}
                                    style={contentData.style}
                                />
                            );

                        case 'review':
                            return (
                                <ReviewBlock
                                    key={block.id}
                                    title={block.title || undefined}
                                    itemName={contentData.itemName || ''}
                                    itemType={contentData.itemType}
                                    reviews={contentData.reviews || []}
                                    showAggregate={contentData.showAggregate}
                                />
                            );

                        default:
                            return null;
                    }
                } catch (error) {
                    console.error('Error rendering block:', block.id, error);
                    return null;
                }
            })}
        </div>
    );
}
