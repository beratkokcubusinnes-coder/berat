import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType, getBlogPostById } from "@/lib/db";
import { getAllContentTranslations } from "@/lib/translations";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
    params
}: {
    params: Promise<{ lang: string, id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('blog');

    const post = await getBlogPostById(id);
    if (!post) notFound();

    const translations = await getAllContentTranslations('blog', id);

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm
                type="blog"
                lang={lang}
                dict={dict}
                categories={categories}
                initialData={post}
                initialTranslations={translations}
            />
        </div>
    );
}
