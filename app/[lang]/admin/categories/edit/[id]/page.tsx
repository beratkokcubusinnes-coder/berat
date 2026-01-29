
import { prisma } from "@/lib/prisma";
import EditCategoryForm from "./EditCategoryForm";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;

    const category = await prisma.category.findUnique({
        where: { id }
    });

    if (!category) {
        notFound();
    }

    return <EditCategoryForm category={category} lang={lang} />;
}
