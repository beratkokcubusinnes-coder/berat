export interface Prompt {
    id: string;
    slug: string;
    title: string;
    images: {
        before: string;
        after: string;
    } | string[];
    model: "Gemini" | "Midjourney" | "DALL-E" | "Stable Diffusion";
    category: string;
    author: {
        id?: string;
        username: string;
        name: string;
        avatar: string;
        verified: boolean;
    };
    metrics: {
        views: number;
        likes: number;
        downloads: number;
    };
    tags: string[];
}

export const CATEGORIES = [
    "All Models",
    "Photography",
    "Portrait",
    "Anime & Manga",
    "3D Render",
    "Architecture",
    "Interior Design",
    "Logo & Icon",
    "UI/UX Design",
    "Game Assets",
    "Fashion",
    "Cinematic",
];

export const MOCK_PROMPTS: Prompt[] = [
    {
        id: "1",
        slug: "cs-go-prompt",
        title: "CS:GO Prompt",
        images: {
            before: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
            after: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&filt=1"
        },
        model: "Gemini",
        category: "Game Assets",
        author: {
            username: "shade",
            name: "Shade",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shade",
            verified: true,
        },
        metrics: { views: 1205, likes: 850, downloads: 120 },
        tags: ["game", "military", "character"],
    },
    {
        id: "2",
        slug: "gta5-loading-screen",
        title: "Gta5 Loading Screen",
        images: {
            before: "https://images.unsplash.com/photo-1624138784181-dc99d00bcd4a?auto=format&fit=crop&q=80&w=600",
            after: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600"
        },
        model: "Gemini",
        category: "Game Assets",
        author: {
            username: "shade",
            name: "Shade",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shade",
            verified: true,
        },
        metrics: { views: 3400, likes: 1200, downloads: 500 },
        tags: ["gta", "loading", "art"],
    },
    {
        id: "3",
        slug: "photo-pixel",
        title: "Photo Pixel",
        images: {
            before: "https://images.unsplash.com/photo-1510227272981-87123e2fe363?auto=format&fit=crop&q=80&w=600",
            after: "https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&q=80&w=600"
        },
        model: "Gemini",
        category: "Photography",
        author: {
            username: "shade",
            name: "Shade",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shade2",
            verified: true,
        },
        metrics: { views: 890, likes: 430, downloads: 40 },
        tags: ["pixel", "soccer", "sports"],
    },
    {
        id: "4",
        slug: "car-sea",
        title: "Car sea",
        images: {
            before: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600",
            after: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600"
        },
        model: "Gemini",
        category: "Architecture",
        author: {
            username: "shade",
            name: "Shade",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shade",
            verified: true,
        },
        metrics: { views: 5600, likes: 2300, downloads: 800 },
        tags: ["car", "underworld", "surreal"],
    },
    {
        id: "5",
        slug: "one-piece-avatar",
        title: "One Piece Avatar",
        images: { before: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600", after: "https://images.unsplash.com/photo-1620067925093-801122ac1408?w=600" },
        model: "Gemini",
        category: "Anime & Manga",
        author: { username: "shade", name: "Shade", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shade", verified: true },
        metrics: { views: 100, likes: 20, downloads: 5 },
        tags: ["anime", "avatar"],
    }
];
