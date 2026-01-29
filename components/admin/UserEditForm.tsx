"use client";

import { useState } from "react";
import { Save, User as UserIcon, Mail, AtSign, Globe, Shield, AlertTriangle, Ban, Loader2, Camera, Upload } from "lucide-react";
import Image from "next/image";

interface UserEditFormProps {
    user: any;
    lang: string;
}

export function UserEditForm({ user, lang }: UserEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        formData.append("id", user.id);

        try {
            const response = await fetch("/api/users/update", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to update user");
            }

            setMessage({ type: 'success', text: "User updated successfully!" });
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reload page after delay to reflect new avatar if changed
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-primary" />
                            Profile Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={user.name || ""}
                                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="username"
                                        defaultValue={user.username}
                                        required
                                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={user.email}
                                        required
                                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                <textarea
                                    name="bio"
                                    defaultValue={user.bio || ""}
                                    rows={3}
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="location"
                                        defaultValue={user.location || ""}
                                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Avatar Upload Section */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-muted-foreground">Profile Picture</label>
                                <div className="flex items-start gap-6">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg bg-muted flex-shrink-0 group">
                                        <Image
                                            src={previewUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                            alt="Preview"
                                            fill
                                            className="object-cover transition-all group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                className="hidden"
                                                id="avatar-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setPreviewUrl(url);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="avatar-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/20 transition-colors w-fit"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Upload New Picture
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG or GIF. Max size of 2MB.
                                            </p>
                                        </div>

                                        {/* Hidden input to keep old URL if not changed */}
                                        <input type="hidden" name="avatar_url_backup" value={user.avatar || ""} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Danger Zone */}
                <div className="space-y-6">
                    {/* Role & Status */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" />
                            Role & Permissions
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">User Role</label>
                                <select
                                    name="role"
                                    defaultValue={user.role}
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <hr className="border-border/50" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    Ban Status
                                    {user.banned && <span className="text-xs text-red-500 font-bold uppercase">Banned</span>}
                                </label>
                                <select
                                    name="banned"
                                    defaultValue={user.banned ? "true" : "false"}
                                    className={`w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${user.banned ? "text-red-500" : "text-green-500"
                                        }`}
                                >
                                    <option value="false">Active (Not Banned)</option>
                                    <option value="true">Banned</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Ban Reason</label>
                                <input
                                    type="text"
                                    name="banReason"
                                    defaultValue={user.banReason || ""}
                                    placeholder="Reason for ban..."
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Warnings Count
                                </label>
                                <input
                                    type="number"
                                    name="warnings"
                                    defaultValue={user.warnings}
                                    min="0"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    );
}
