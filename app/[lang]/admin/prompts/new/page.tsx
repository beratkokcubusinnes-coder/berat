import { getDictionary } from "@/lib/dictionary";
import { NewPromptForm } from "@/components/admin/NewPromptForm";
import { getCategoriesByType } from "@/lib/db";

export default async function NewPromptPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('prompt');

    return (
        <div className="-m-4 sm:-m-8">
            <NewPromptForm lang={lang} dict={dict} categories={categories} />
        </div>
    );
}
