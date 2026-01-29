import { getDictionary } from "@/lib/dictionary";
import LoginPage from "@/components/auth/LoginPage";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <LoginPage params={{ lang }} dict={dict} />;
}
