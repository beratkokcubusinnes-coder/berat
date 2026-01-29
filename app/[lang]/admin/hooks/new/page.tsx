import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType } from "@/lib/db";

export default async function NewHookPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('hook');

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm type="hook" lang={lang} dict={dict} categories={categories} />
        </div>
    );
}
