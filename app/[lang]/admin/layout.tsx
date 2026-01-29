import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const session = await getSession();
    const dict = await getDictionary(lang);

    if (!session || !session.userId) {
        redirect(`/${lang}/login`);
    }

    const user = await getUserById(session.userId as string);
    if (!user || user.role !== 'admin') {
        // Not an admin, redirect to home
        redirect(`/${lang}`);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
            {/* Admin Sidebar */}
            <AdminSidebar lang={lang} dict={dict} />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 relative min-h-screen flex flex-col">
                <TopNavbar lang={lang} dict={dict} user={user} />

                <main className="p-6 md:p-8 flex-1">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer for Admin Area */}
                <footer className="p-6 border-t border-border mt-auto bg-card/30">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                        <p className="text-xs text-muted-foreground/60 font-medium">© 2026 Promptda System Administration</p>
                        <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">
                            <span className="hover:text-primary transition-colors cursor-pointer">Version 1.0.4-Beta</span>
                            <span className="hover:text-primary transition-colors cursor-pointer">System Status: Optimal</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
