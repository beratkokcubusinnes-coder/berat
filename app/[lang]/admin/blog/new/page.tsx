import { getDictionary } from "@/lib/dictionary";
import { AdminContentForm } from "@/components/admin/AdminContentForm";
import { getCategoriesByType } from "@/lib/db";

export default async function NewBlogPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('blog');

    return (
        <div className="-m-4 sm:-m-8">
            <AdminContentForm type="blog" lang={lang} dict={dict} categories={categories} />
        </div>
    );
}
