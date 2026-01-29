import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import SettingsPage from "@/components/settings/SettingsPage";

export default async function Settings({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    return <SettingsPage user={session || {}} lang={lang} dict={dict} />;
}
