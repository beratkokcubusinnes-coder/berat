"use client";

interface StructuredDataProps {
    prompt: any;
    faq?: Array<{ question: string; answer: string }>;
}

export function PromptSEO({ prompt, faq }: StructuredDataProps) {
    // Main Product/Prompt Schema
    const promptSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": prompt.title,
        "description": prompt.description || prompt.title,
        "codeSampleType": "AI Prompt",
        "programmingLanguage": prompt.model,
        "author": {
            "@type": "Person",
            "name": prompt.author.name
        },
        "datePublished": prompt.createdAt,
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

    // HowTo Schema
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to use ${prompt.title}`,
        "step": [
            {
                "@type": "HowToStep",
                "text": `Copy the prompt command from the ${prompt.model} section.`
            },
            {
                "@type": "HowToStep",
                "text": `Paste it into your ${prompt.model} interface.`
            },
            {
                "@type": "HowToStep",
                "text": "Press enter and generate your artwork."
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
