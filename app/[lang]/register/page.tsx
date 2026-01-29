import { getDictionary } from "@/lib/dictionary";
import RegisterPage from "@/components/auth/RegisterPage";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <RegisterPage params={{ lang }} dict={dict} />;
}
