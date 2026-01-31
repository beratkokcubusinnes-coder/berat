import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getUsers } from "@/lib/db";
import MembersPage from "@/components/members/MembersPage";

import { getPageSeo } from "@/lib/seo-settings";
import { getSitemapAlternates, getCanonicalUrl } from "@/lib/sitemap-utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const seo = await getPageSeo("Members", lang);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';
    const path = '/members';

    return {
        title: seo.title || "Community Members | Promptda",
        description: seo.description || "Meet our top creators and prompt engineers.",
        alternates: {
            canonical: getCanonicalUrl(path, lang, baseUrl),
            languages: getSitemapAlternates(path, baseUrl)
        }
    };
}

export default async function Members({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const users = await getUsers();

    return <MembersPage users={users} currentUser={session} lang={lang} dict={dict} />;
}
