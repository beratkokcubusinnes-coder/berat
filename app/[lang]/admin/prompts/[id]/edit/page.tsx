import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import { notFound } from "next/navigation";
import { getCategoriesByType } from "@/lib/db";
import { getAllContentTranslations } from "@/lib/translations";
import { NewPromptForm } from "@/components/admin/NewPromptForm";

export default async function EditPromptPage({
    params
}: {
    params: Promise<{ lang: string; id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('prompt');

    const prompt = await prisma.prompt.findUnique({
        where: { id },
        include: { author: true }
    });

    if (!prompt) {
        notFound();
    }

    const translations = await getAllContentTranslations('prompt', id);

    return (
        <div className="-m-4 sm:-m-8">
            <NewPromptForm
                initialData={prompt}
                initialTranslations={translations}
                lang={lang}
                dict={dict}
                categories={categories}
            />
        </div>
    );
}
