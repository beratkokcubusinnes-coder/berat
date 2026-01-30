import LoginPage from "@/components/auth/LoginPage";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
    title: "Login | Promptda",
    robots: "noindex, nofollow"
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <LoginPage params={{ lang }} dict={dict} />;
}
