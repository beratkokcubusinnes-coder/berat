import RegisterPage from "@/components/auth/RegisterPage";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
    title: "Register | Promptda",
    robots: "noindex, nofollow"
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <RegisterPage params={{ lang }} dict={dict} />;
}
