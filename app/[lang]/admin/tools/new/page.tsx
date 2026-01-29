import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType } from "@/lib/db";

export default async function NewToolPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('tool');

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm type="tool" lang={lang} dict={dict} categories={categories} />
        </div>
    );
}
