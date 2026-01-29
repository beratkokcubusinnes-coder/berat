import { getDictionary } from '@/lib/dictionary';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { PromptUploadWizard } from '@/components/prompts/PromptUploadWizard';
import { getCategoriesByType } from '@/lib/db';
import { getHref } from '@/lib/i18n';

export default async function UploadPage({ params }: { params: any }) {
    const { lang } = await params;
    const session = await getSession();

    if (!session || !session.userId) {
        redirect(getHref('/login', lang));
    }

    const dict = await getDictionary(lang);
    const categories = await getCategoriesByType('prompt');

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative z-10">
                <PromptUploadWizard
                    lang={lang}
                    categories={categories}
                    dict={dict}
                />
            </div>
        </main>
    );
}
