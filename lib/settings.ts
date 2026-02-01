import { prisma } from "@/lib/prisma";

export const DEFAULTS = {
    // General
    default_avatar: "/images/default-avatar.png",
    site_logo: "/images/logo.png",
    site_icon: "/images/icon.png",
    site_favicon: "/favicon.ico",
    site_name: "Promptda",
    app_url: "",
    site_logo_alt: "Promptda Logo",
    site_icon_alt: "Promptda Icon",
    default_avatar_alt: "Default User Avatar",

    // Limits
    daily_prompt_limit: "5",
    daily_community_post_limit: "5",
    daily_comment_limit: "20",

    // Spam / Security
    post_cool_down_minutes: "5",
    new_user_restriction_hours: "24",
    enable_registration: "true",
    maintenance_mode: "false",

    // Moderation
    auto_approve_threads: "true",
    auto_approve_comments: "true",
    word_blacklist: "",

    // SEO & Integrations
    google_analytics_id: "",
    meta_tags_extra: "",
    custom_footer_script: "",

    // Storage
    max_image_upload_size_mb: "5",
    allowed_image_types: "image/jpeg,image/png,image/webp,image/gif",

    // Navigation (JSON)
    navigation_sidebar: JSON.stringify([
        { id: "disc", name: "Discover", icon: "Compass", href: "/", isDefault: true },
        { id: "prom", name: "Prompts", icon: "Sparkles", href: "/prompts", isDefault: true },
        { id: "scrip", name: "Scripts", icon: "FileCode2", href: "/scripts", isDefault: true },
        { id: "hook", name: "Hooks", icon: "Anchor", href: "/hooks", isDefault: true },
        { id: "memb", name: "Members", icon: "Users", href: "/members", isDefault: true },
        { id: "tool", name: "Tools", icon: "Wrench", href: "/tools", isDefault: true },
        { id: "comm", name: "Community", icon: "MessageCircle", href: "/community", isDefault: true },
        { id: "blog", name: "Blog", icon: "BookOpen", href: "/blog", isDefault: true },
        { id: "fav", name: "Favorites", icon: "Heart", href: "/favorites", isDefault: true }
    ]),
    navigation_header: JSON.stringify([
        { id: "search", name: "Search", type: "search", isDefault: true },
        { id: "lang", name: "Language", type: "language", isDefault: true },
        { id: "theme", name: "Theme", type: "theme", isDefault: true },
        { id: "upload", name: "Upload", type: "button", href: "/upload", isDefault: true },
        { id: "notif", name: "Notifications", type: "notifications", isDefault: true },
        { id: "user", name: "User Menu", type: "user", isDefault: true }
    ]),

    // RSS Feed Settings
    rss_feed_title: "Promptda - Premium AI Prompts & Resources",
    rss_feed_description: "Latest AI prompts, scripts, community discussions and blog posts from Promptda.",
    rss_feed_limit: "50",
    rss_feed_language: "en-us"
};

// Removed unstable_cache to fetch data directly from DB
export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSetting.findMany();
        const map: Record<string, any> = {};
        settings.forEach(s => map[s.key] = s.value);

        const finalSettings = { ...DEFAULTS, ...map };

        // Fetch metadata for system assets
        const assetUrls = [
            finalSettings.site_logo,
            finalSettings.site_icon,
            finalSettings.default_avatar
        ].filter(url => url && !url.startsWith('http'));

        // Metadata fetching wrapped in try-catch to be safe
        try {
            const mediaItems = await prisma.media.findMany({
                where: { url: { in: assetUrls } }
            });

            // Add metadata fields
            mediaItems.forEach(item => {
                if (item.url === finalSettings.site_logo) {
                    finalSettings.site_logo_alt = item.altText || finalSettings.site_logo_alt;
                }
                if (item.url === finalSettings.site_icon) {
                    finalSettings.site_icon_alt = item.altText || finalSettings.site_icon_alt;
                }
                if (item.url === finalSettings.default_avatar) {
                    finalSettings.default_avatar_alt = item.altText || finalSettings.default_avatar_alt;
                }
            });
        } catch (mediaError) {
            console.warn("Failed to fetch media metadata", mediaError);
        }

        return finalSettings;
    } catch (e) {
        console.error("Failed to fetch settings", e);
        return DEFAULTS;
    }
}

export async function getSystemSetting(key: keyof typeof DEFAULTS) {
    try {
        const setting = await prisma.systemSetting.findUnique({ where: { key } });
        if (setting) return setting.value;
    } catch (e) { }
    return DEFAULTS[key];
}
