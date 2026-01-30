import RegisterPage from "@/components/auth/RegisterPage";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { getSystemSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Register | Promptda",
    robots: "noindex, nofollow"
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const settings = await getSystemSettings();

    if (settings.enable_registration === "false") {
        redirect(`/${lang}/login`);
    }

    return <RegisterPage params={{ lang }} dict={dict} />;
}
