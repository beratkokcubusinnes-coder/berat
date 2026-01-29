// FAQ Schema
export function generateFAQSchema(title: string, items: Array<{ question: string; answer: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "name": title,
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer.replace(/<[^>]*>/g, '') // Strip HTML for schema
            }
        }))
    };
}

// HowTo Schema
export function generateHowToSchema(
    title: string,
    description: string,
    steps: Array<{ name: string; text: string; image?: string }>
) {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": title,
        "description": description,
        "step": steps.map((step, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name,
            "text": step.text,
            ...(step.image && { "image": step.image })
        }))
    };
}

// Video Schema
export function generateVideoSchema(
    title: string,
    description: string,
    thumbnailUrl: string,
    uploadDate: string,
    contentUrl: string,
    embedUrl: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": title,
        "description": description,
        "thumbnailUrl": thumbnailUrl,
        "uploadDate": uploadDate,
        "contentUrl": contentUrl,
        "embedUrl": embedUrl
    };
}

// ImageObject Schema
export function generateImageObjectSchema(
    url: string,
    caption?: string,
    width?: number,
    height?: number,
    author?: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "contentUrl": url,
        "url": url,
        ...(caption && { "caption": caption }),
        ...(width && { "width": width }),
        ...(height && { "height": height }),
        ...(author && {
            "author": {
                "@type": "Person",
                "name": author
            }
        })
    };
}

// Review Schema
export function generateReviewSchema(
    itemName: string,
    reviewBody: string,
    rating: number,
    author: string,
    datePublished: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "Review",
        "itemReviewed": {
            "@type": "Thing",
            "name": itemName
        },
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": rating,
            "bestRating": 5
        },
        "author": {
            "@type": "Person",
            "name": author
        },
        "reviewBody": reviewBody,
        "datePublished": datePublished
    };
}

// AggregateRating Schema
export function generateAggregateRatingSchema(
    itemName: string,
    itemType: string,
    ratingValue: number,
    reviewCount: number,
    bestRating: number = 5
) {
    return {
        "@context": "https://schema.org",
        "@type": itemType, // "Product", "SoftwareApplication", etc.
        "name": itemName,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingValue,
            "reviewCount": reviewCount,
            "bestRating": bestRating
        }
    };
}
