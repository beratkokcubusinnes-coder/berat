import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType, getScriptById } from "@/lib/db";
import { getAllContentTranslations } from "@/lib/translations";
import { notFound } from "next/navigation";

export default async function EditScriptPage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('script');

    const script = await getScriptById(id);
    if (!script) notFound();

    const translations = await getAllContentTranslations('script', id);

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm
                type="script"
                lang={lang}
                dict={dict}
                categories={categories}
                initialData={script}
                initialTranslations={translations}
            />
        </div>
    );
}
