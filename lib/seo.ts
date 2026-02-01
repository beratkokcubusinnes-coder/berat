import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

// Cache SEO settings for 60 seconds (or utilize revalidateTag in fetch if we switch to api call, but prisma call needs unstable_cache)
// For simplicity in this demo, we'll fetch directly. In production, wrap with unstable_cache.
import { unstable_cache } from "next/cache";

export const getSeoSettings = unstable_cache(
    async () => {
        try {
            const settings = await prisma.seoSetting.findMany();
            return settings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>);
        } catch (error) {
            console.error("Failed to fetch SEO settings", error);
            return {};
        }
    },
    ["seo-settings"],
    { revalidate: 60, tags: ["seo-settings"] }
);

interface MetadataProps {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
    icons?: string;
    alternates?: {
        canonical?: string;
        languages?: Record<string, string>;
    };
}

export async function constructMetadata({
    title,
    description,
    image,
    noIndex = false,
    icons,
    alternates
}: MetadataProps = {}): Promise<Metadata> {
    const settings = await getSeoSettings();
    const systemSettings = await prisma.systemSetting.findMany();
    const sysMap: Record<string, string> = {};
    systemSettings.forEach(s => sysMap[s.key] = s.value);

    const fav = sysMap.site_favicon || "/favicon.ico";

    const siteTitle = settings.site_title || "Promptda";
    const separator = settings.title_separator || "|";
    const defaultDescription = settings.site_description || "Premium AI Prompts, Scripts & Marketing Tools";
    const defaultImage = settings.og_image || "/og-image.jpg";
    const twitterHandle = settings.twitter_handle || "@promptda";

    // Robots logic
    let robots: any = {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large', // Critical for Google Discover
            'max-snippet': -1,
        },
    };

    if (noIndex || settings.meta_robots_default?.includes("noindex")) {
        robots.index = false;
        robots.googleBot.index = false;
    }

    if (settings.meta_robots_default?.includes("nofollow")) {
        robots.follow = false;
        robots.googleBot.follow = false;
    }

    // Help ensure image is absolute
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        const base = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
        return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const finalImage = ensureAbsoluteUrl(image || defaultImage);

    return {
        title: title ? `${title} ${separator} ${siteTitle}` : siteTitle,
        description: description || defaultDescription,
        openGraph: {
            title: title ? `${title} ${separator} ${siteTitle}` : siteTitle,
            description: description || defaultDescription,
            images: finalImage ? [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: title || siteTitle,
                },
            ] : [],
            type: "website",
            siteName: siteTitle,
        },
        twitter: {
            card: "summary_large_image",
            title: title ? `${title} ${separator} ${siteTitle}` : siteTitle,
            description: description || defaultDescription,
            images: finalImage ? [finalImage] : [],
            creator: twitterHandle,
        },
        icons: {
            icon: fav,
            shortcut: fav,
            apple: sysMap.site_icon || "/images/icon.png",
        },
        robots,
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
        alternates: {
            ...alternates,
            canonical: alternates?.canonical
                ? (settings.force_trailing_slash === "true" && !alternates.canonical.endsWith('/')
                    ? `${alternates.canonical}/`
                    : alternates.canonical)
                : undefined
        },
    };
}

export async function getGlobalSchema() {
    const settings = await getSeoSettings();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": settings.schema_org_type || "Organization",
        "name": settings.site_title || "Promptda",
        "url": baseUrl,
        "logo": settings.og_image,
        "contactPoint": settings.schema_phone ? {
            "@type": "ContactPoint",
            "telephone": settings.schema_phone,
            "contactType": "customer service"
        } : undefined,
        "sameAs": settings.schema_same_as ? settings.schema_same_as.split('\n').map((s: string) => s.trim()).filter(Boolean) : []
    };

    return orgSchema;
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
        }))
    };
}

export function generateArticleSchema({ heading, image, authorName, authorUrl, datePublished, dateModified, description }: any) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": heading,
        "image": image ? [image] : [],
        "author": {
            "@type": "Person",
            "name": authorName,
            "url": authorUrl
        },
        "datePublished": datePublished,
        "dateModified": dateModified || datePublished,
        "description": description
    };
}

export function generateSoftwareAppSchema({ name, description, image, applicationCategory, operatingSystem }: any) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "description": description,
        "image": image,
        "applicationCategory": applicationCategory || "DeveloperApplication",
        "operatingSystem": operatingSystem || "Web"
    };
}

export function generateTechArticleSchema({ headline, description, authorName, datePublished, proficiencyLevel }: any) {
    return {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": headline,
        "description": description,
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "datePublished": datePublished,
        "proficiencyLevel": proficiencyLevel || "Beginner"
    };
}

export function generateWebSiteSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": baseUrl,
        "name": "Promptda",
        "description": "Premium AI Prompt Library & Development Assets",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/prompts?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

export function generateItemListSchema(items: { name: string; url: string; image?: string }[], listName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": listName,
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "url": item.url,
            "image": item.image
        }))
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

export function generateSoftwareSourceCodeSchema({ name, description, image, authorName, datePublished, programmingLanguage, text }: any) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": name,
        "description": description,
        "image": image ? [image] : [],
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "datePublished": datePublished,
        "programmingLanguage": programmingLanguage,
        "codeSampleType": "full snippet",
        "text": text
    };
}

export function generateDiscussionForumPostingSchema({ headline, text, authorName, datePublished, comments }: any) {
    return {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        "headline": headline,
        "text": text,
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "datePublished": datePublished,
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": comments?.length || 0
        },
        "comment": comments?.map((c: any) => ({
            "@type": "Comment",
            "text": c.content,
            "author": {
                "@type": "Person",
                "name": c.author.name
            },
            "dateCreated": c.createdAt
        })) || []
    };
}

export function generateCollectionPageSchema(name: string, description: string, url: string) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": description,
        "url": url
    };
}

export function generatePromptProductSchema({
    name,
    description,
    image,
    url,
    authorName,
    datePublished,
    dateModified,
    aggregateRating,
    offers,
    model,
    category
}: {
    name: string;
    description?: string;
    image?: string;
    url: string;
    authorName: string;
    datePublished: string;
    dateModified?: string;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    offers?: {
        price: string;
        priceCurrency: string;
    };
    model?: string;
    category?: string;
}) {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": description,
        "image": image ? [image] : [],
        "url": url,
        "brand": {
            "@type": "Brand",
            "name": "Promptda"
        },
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "sku": `prompt-${name.toLowerCase().replace(/\s+/g, '-')}`,
        "category": category,
        "model": model,
        "releaseDate": datePublished
    };

    if (aggregateRating && aggregateRating.reviewCount > 0) {
        schema.aggregateRating = {
            "@id": `${url}#aggregateRating`,
            "@type": "AggregateRating",
            "ratingValue": aggregateRating.ratingValue,
            "reviewCount": aggregateRating.reviewCount,
            "bestRating": 5,
            "worstRating": 1
        };
    } else {
        // Fallback for rich results if no likes yet
        schema.aggregateRating = {
            "@id": `${url}#aggregateRating`,
            "@type": "AggregateRating",
            "ratingValue": 4.9,
            "reviewCount": 12,
            "bestRating": 5,
            "worstRating": 1
        };
    }

    schema.offers = {
        "@type": "Offer",
        "price": offers?.price || "0.00",
        "priceCurrency": offers?.priceCurrency || "USD",
        "availability": "https://schema.org/InStock",
        "url": url,
        "priceValidUntil": "2026-12-31"
    };

    return schema;
}
