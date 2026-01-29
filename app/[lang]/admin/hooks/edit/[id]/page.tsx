import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType, getHookById } from "@/lib/db";
import { getAllContentTranslations } from "@/lib/translations";
import { notFound } from "next/navigation";

export default async function EditHookPage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('hook');

    const hook = await getHookById(id);
    if (!hook) notFound();

    const translations = await getAllContentTranslations('hook', id);

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm
                type="hook"
                lang={lang}
                dict={dict}
                categories={categories}
                initialData={hook}
                initialTranslations={translations}
            />
        </div>
    );
}
