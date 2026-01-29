"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import UserAvatar from "@/components/ui/UserAvatar";
import { updateProfile } from "@/actions/user";
import { User, Bell, Shield, Moon, Trash2, Save, Camera, Loader2 } from "lucide-react";

export default function SettingsPage({ user, lang, dict }: { user: any, lang: string, dict: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const res = await updateProfile(formData);

            if (res.error) {
                alert(res.error);
            } else if (res.success) {
                router.refresh();
                alert("Profile updated successfully!");
            }
        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar lang={lang} dict={dict} user={user} />

            <div className="md:ml-64 relative">
                <TopNavbar lang={lang} dict={dict} user={user} />

                <main className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">{dict.Settings?.title || "Settings"}</h1>
                        <p className="text-muted-foreground">{dict.Settings?.subtitle || "Manage your account preferences"}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="space-y-2 lg:col-span-1">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm transition-colors text-left border border-primary/20">
                                <User className="w-4 h-4" />
                                {dict.Settings?.account || "Account"}
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
                                <Bell className="w-4 h-4" />
                                {dict.Settings?.notifications || "Notifications"}
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
                                <Moon className="w-4 h-4" />
                                {dict.Settings?.appearance || "Appearance"}
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
                                <Shield className="w-4 h-4" />
                                {dict.Settings?.section?.security || "Security"}
                            </button>
                        </div>

                        <div className="lg:col-span-3 space-y-8">
                            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-8">
                                <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">{dict.Settings?.section?.profile || "Profile Settings"}</h2>

                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <UserAvatar src={avatarPreview} alt={user.name} size={100} className="ring-4 ring-background shadow-xl" />
                                        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                            <Camera className="w-6 h-6" />
                                            <input type="file" name="avatar" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-foreground">Profile Picture</h3>
                                        <p className="text-xs text-muted-foreground">Click the image to upload a new photo.</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">{dict.Settings?.fields?.displayName || "Display Name"}</label>
                                        <input name="name" type="text" defaultValue={user.name} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">{dict.Settings?.fields?.username || "Username"}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50">@</span>
                                            <input name="username" type="text" defaultValue={user.username || user.name?.toLowerCase().replace(/\s/g, '')} className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">{dict.Profile?.bio || "Bio"}</label>
                                        <textarea name="bio" defaultValue={user.bio} rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none" placeholder="Tell us a little about yourself..." />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {dict.Profile?.saveChanges || "Save Changes"}
                                    </button>
                                </div>
                            </form>

                            <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    {dict.Settings?.deleteAccount || "Delete Account"}
                                </h2>
                                <p className="text-sm text-red-500/70">{dict.Settings?.deleteWarning || "Once you delete your account, there is no going back. Please be certain."}</p>
                                <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium px-4 py-2 rounded-lg transition-colors text-sm">
                                    {dict.Settings?.deleteAccount || "Delete Account"}
                                </button>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
