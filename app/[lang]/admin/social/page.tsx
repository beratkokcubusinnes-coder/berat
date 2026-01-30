import { ShareDashboard } from "@/components/admin/social/ShareDashboard";
import { SocialSettings } from "@/components/admin/social/SocialSettings";
import { getSocialCredentials, getShareableContent } from "@/actions/social-share";
import { getSystemSettings } from "@/lib/settings";

export default async function AdminSocialPage({ params }: { params: { lang: string } }) {
    const [credentials, content, settings] = await Promise.all([
        getSocialCredentials(),
        getShareableContent(),
        getSystemSettings()
    ]);

    const baseUrl = settings.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

    return (
        <div className="space-y-8 p-6 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight">Social Auto-Post</h1>
                <p className="text-muted-foreground">Manage your social connections and auto-share content.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                {/* Main Content Area */}
                <div className="order-2 lg:order-1">
                    <ShareDashboard items={content} baseUrl={baseUrl} />
                </div>

                {/* Sidebar Settings Area */}
                <div className="order-1 lg:order-2">
                    <div className="sticky top-6">
                        <SocialSettings initialData={credentials} />
                    </div>
                </div>
            </div>
        </div>
    );
}
