"use client";

import { Star } from "lucide-react";
import { generateReviewSchema, generateAggregateRatingSchema } from "@/lib/block-schemas";

interface Review {
    author: string;
    rating: number;
    body: string;
    date: string;
    avatar?: string;
}

interface ReviewBlockProps {
    title?: string;
    itemName: string; // Product/Tool/Service name
    itemType?: string; // "Product", "SoftwareApplication", "Service"
    reviews: Review[];
    showAggregate?: boolean;
}

export function ReviewBlock({
    title,
    itemName,
    itemType = "Product",
    reviews,
    showAggregate = true
}: ReviewBlockProps) {
    // Calculate aggregate rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    const aggregateSchema = showAggregate
        ? generateAggregateRatingSchema(itemName, itemType, avgRating, reviewCount)
        : null;

    return (
        <section className="bg-card/50 border border-border rounded-3xl p-8 md:p-12 space-y-6">
            {aggregateSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateSchema) }}
                />
            )}

            {title && (
                <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            )}

            {/* Aggregate Rating Display */}
            {showAggregate && (
                <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="text-center">
                        <div className="text-5xl font-black text-primary">{avgRating.toFixed(1)}</div>
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(avgRating)
                                            ? 'fill-primary text-primary'
                                            : 'text-muted-foreground'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">
                            Based on <span className="font-bold text-foreground">{reviewCount}</span> reviews
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {itemName}
                        </div>
                    </div>
                </div>
            )}

            {/* Individual Reviews */}
            <div className="space-y-4">
                {reviews.map((review, index) => {
                    const reviewSchema = generateReviewSchema(
                        itemName,
                        review.body,
                        review.rating,
                        review.author,
                        review.date
                    );

                    return (
                        <div key={index} className="border border-border rounded-2xl p-6 space-y-3">
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {review.avatar ? (
                                        <img
                                            src={review.avatar}
                                            alt={review.author}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {review.author.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold">{review.author}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(review.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= review.rating
                                                    ? 'fill-primary text-primary'
                                                    : 'text-muted-foreground'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-muted-foreground leading-relaxed">
                                {review.body}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
