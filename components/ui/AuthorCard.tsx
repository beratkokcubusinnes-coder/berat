"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import { followUser, unfollowUser, isFollowing as checkFollowing } from "@/actions/social";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
    author: {
        id: string;
        name: string;
        username: string;
        avatar?: string | null;
    };
    stats: {
        views: number;
        likes: number;
    };
    currentUser?: any;
    lang: string;
}

export function AuthorCard({ author, stats, currentUser, lang }: AuthorCardProps) {
    const [isFollowed, setIsFollowed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.userId === author.id) {
            setIsOwnProfile(true);
        } else if (currentUser && author.id) {
            checkFollowing(author.id).then(setIsFollowed);
        }
    }, [author.id, currentUser]);

    const handleFollowToggle = async () => {
        if (!currentUser) return alert("Please login to follow creators");

        setLoading(true);
        try {
            if (isFollowed) {
                const res = await unfollowUser(author.id);
                if (res.success) setIsFollowed(false);
            } else {
                const res = await followUser(author.id);
                if (res.success) setIsFollowed(true);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl animate-in slide-in-from-right-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/${lang}/profile/${author.username}`}>
                    <UserAvatar
                        src={author.avatar}
                        alt={author.name}
                        className="w-16 h-16 border-2 border-primary shadow-lg shadow-primary/20 cursor-pointer transition-transform hover:scale-105"
                    />
                </Link>
                <div className="flex-1">
                    <Link href={`/${lang}/profile/${author.username}`} className="hover:underline">
                        <h3 className="font-black text-lg tracking-tight">{author.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground font-bold">@{author.username}</p>
                </div>

                {!isOwnProfile && (
                    <button
                        onClick={handleFollowToggle}
                        disabled={loading}
                        className={cn(
                            "text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg",
                            isFollowed
                                ? "bg-muted text-foreground border border-border hover:bg-red-500/10 hover:text-red-500"
                                : "bg-primary text-white hover:scale-105 shadow-primary/25"
                        )}
                    >
                        {loading ? "..." : (isFollowed ? "Unfollow" : "Follow")}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 py-6 border-y border-border/50">
                <div className="text-center">
                    <span className="block text-lg font-black">{stats.likes}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Likes</span>
                </div>
                <div className="text-center border-x border-border/50">
                    <span className="block text-lg font-black">{stats.views}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Views</span>
                </div>
                <div className="text-center">
                    <span className="block text-lg font-black">12</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Shares</span>
                </div>
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted font-black text-sm transition-all flex items-center justify-center gap-3 group">
                <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Share Asset
            </button>
        </div>
    );
}
