"use client";

import { useState, useRef } from "react";
import { updateProfile } from "@/actions/user";
import { useRouter } from "next/navigation";
import { User, MapPin, AlignLeft, Camera, Loader2, Save, X } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

interface EditProfileFormProps {
    user: any;
    lang: string;
    dict: any;
}

export default function EditProfileForm({ user, lang, dict }: EditProfileFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
    const [coverPreview, setCoverPreview] = useState<string | null>(user.coverImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateProfile(formData);
            if (result.error) {
                setError(result.error);
            } else {
                await router.refresh();
                router.push(`/${lang}/profile/${result.user?.username}`);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Cover and Avatar Upload Section */}
            <div className="space-y-6">
                <p className="text-xs text-center text-muted-foreground uppercase font-black tracking-widest">Profile Cover & Avatar</p>

                <div className="relative">
                    {/* Cover Preview */}
                    <div
                        className="relative h-48 w-full rounded-2xl overflow-hidden bg-muted group cursor-pointer"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-600/20 animate-gradient-x" />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <input
                            type="file"
                            name="coverImage"
                            ref={coverInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverChange}
                        />
                    </div>

                    {/* Avatar Preview */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 group">
                        <UserAvatar
                            src={avatarPreview}
                            alt={user.name}
                            className="w-24 h-24 border-4 border-background shadow-2xl bg-card cursor-pointer"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 group-hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Camera className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            name="avatar"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>
                <div className="h-4" /> {/* Spacer */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user.name}
                        placeholder="Your display name"
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                    />
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Username
                    </label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <input
                            type="text"
                            name="username"
                            defaultValue={user.username}
                            placeholder="username"
                            className="w-full bg-background border border-border rounded-2xl pl-10 pr-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        defaultValue={user.location}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <AlignLeft className="w-3 h-3" />
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        defaultValue={user.bio}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs border border-border hover:bg-muted/50 transition-all"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
