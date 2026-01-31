import { getAdminStats } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import AdminDashboard from "@/components/admin/AdminDashboard";


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return {
        title: `Dashboard`,
        description: `Admin Control Center`
    };
}

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const stats = await getAdminStats();
    const dict = await getDictionary(lang);

    return <AdminDashboard stats={stats} lang={lang} dict={dict} />;
}
