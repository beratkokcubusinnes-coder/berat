"use client";

interface StructuredDataProps {
    prompt: any;
    faq?: Array<{ question: string; answer: string }>;
}

export function PromptSEO({ prompt, faq }: StructuredDataProps) {
    const mainImage = prompt.images.includes(',') ? prompt.images.split(',')[0] : prompt.images;

    // Main Software Source Code Schema (Prompt Specific)
    const promptSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": prompt.title,
        "description": prompt.metaDescription || prompt.description?.replace(/<[^>]*>/g, '').substring(0, 160),
        "image": mainImage,
        "codeSampleType": "AI Prompt Command",
        "programmingLanguage": {
            "@type": "ComputerLanguage",
            "name": prompt.model
        },
        "author": {
            "@type": "Person",
            "name": prompt.author.name
        },
        "datePublished": prompt.createdAt,
        "text": prompt.content,
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ViewAction",
                "userInteractionCount": prompt.views
            },
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": prompt.likes
            }
        ]
    };

    // FAQ Schema if available
    const faqSchema = faq && faq.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // HowTo Schema - Enhanced for better Rich Result Detection
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to use ${prompt.title} on ${prompt.model}`,
        "description": `Detailed guide on implementing the ${prompt.title} asset into your workflow.`,
        "image": mainImage,
        "tool": [
            {
                "@type": "HowToTool",
                "name": prompt.model
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Copy Command",
                "text": `Copy the prompt command from the ${prompt.model} section on this page.`,
                "url": "#copy-prompt",
                "image": mainImage
            },
            {
                "@type": "HowToStep",
                "name": "Access Interface",
                "text": `Open your ${prompt.model} interface or workspace.`,
                "url": "#access"
            },
            {
                "@type": "HowToStep",
                "name": "Execute & Generate",
                "text": "Paste the prompt and press enter to generate your professional artwork or text output.",
                "url": "#execute"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(promptSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
        </>
    );
}
