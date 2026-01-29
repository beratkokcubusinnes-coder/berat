import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default async function EditProfilePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await getSession();

    if (!session || !session.userId) {
        redirect(`/${lang}/login`);
    }

    const dict = await getDictionary(lang);

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string }
    });

    if (!user) notFound();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={session} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={session} />

                <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">{dict.Profile?.editProfile || "Edit Profile"}</h1>
                        <p className="text-muted-foreground">Update your personal information and profile picture.</p>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
                        <EditProfileForm user={user} lang={lang} dict={dict} />
                    </div>
                </main>
            </div>
        </div>
    );
}
