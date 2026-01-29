import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType, getToolById } from "@/lib/db";
import { getAllContentTranslations } from "@/lib/translations";
import { notFound } from "next/navigation";

export default async function EditToolPage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('tool');
    const tool = await getToolById(id);

    if (!tool) {
        notFound();
    }

    const translations = await getAllContentTranslations('tool', id);

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm
                type="tool"
                lang={lang}
                dict={dict}
                categories={categories}
                initialData={tool}
                initialTranslations={translations}
            />
        </div>
    );
}
