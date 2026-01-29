import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getSystemSettings } from "@/lib/settings";
import SystemSettingsForm from "@/components/admin/settings/SystemSettingsForm";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();

    // Check if user is admin (simplified for now)
    // if (session?.role !== 'admin') {
    //     return <div>Unauthorized</div>;
    // }

    const settings = await getSystemSettings();
    const { getMedia } = await import("@/actions/media");
    const media = await getMedia();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Main Content Area */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                    </div>
                    <p className="text-sm text-muted-foreground ml-1">
                        Configure advanced SaaS global parameters, usage limits, and platform security.
                    </p>
                </div>

                <SystemSettingsForm initialSettings={settings} initialMedia={media} />
            </div>
        </div>
    );
}
