'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { shareToTwitter, shareToFacebook } from '@/actions/social-share';
import { toast } from 'sonner';
import { Twitter, Facebook, Loader2, ExternalLink, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ContentItem {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    type: 'prompt' | 'blog';
}

export function ShareDashboard({ items, baseUrl }: { items: ContentItem[], baseUrl: string }) {
    const [processing, setProcessing] = useState<Record<string, boolean>>({});

    // Track shared status simply in local state for this session (could be persisted in DB ideally)
    const [sharedStatus, setSharedStatus] = useState<Record<string, { twitter?: boolean, facebook?: boolean }>>({});

    const handleShare = async (item: ContentItem, platform: 'twitter' | 'facebook') => {
        const key = `${item.id}-${platform}`;
        setProcessing(p => ({ ...p, [key]: true }));

        const url = `${baseUrl}/${item.type === 'prompt' ? 'prompts' : 'blog'}/${item.slug}`;
        const message = `Check out this new ${item.type}: ${item.title}`;

        try {
            const result = platform === 'twitter'
                ? await shareToTwitter(item.id, item.type, message, url)
                : await shareToFacebook(item.id, item.type, message, url);

            if (result.success) {
                toast.success(`Shared to ${platform} successfully!`);
                setSharedStatus(prev => ({
                    ...prev,
                    [item.id]: {
                        ...prev[item.id],
                        [platform]: true
                    }
                }));
            } else {
                toast.error(`Failed to share: ${result.error}`);
            }
        } catch (e) {
            toast.error('Unexpected error sharing content');
        } finally {
            setProcessing(p => ({ ...p, [key]: false }));
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Latest Content to Share
            </h2>

            <div className="grid gap-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.type === 'prompt' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {item.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-medium text-lg leading-tight">{item.title}</h3>
                            <Link
                                href={`/${item.type === 'prompt' ? 'prompts' : 'blog'}/${item.slug}`}
                                target="_blank"
                                className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View on site
                            </Link>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {/* Twitter Button */}
                            <Button
                                variant={sharedStatus[item.id]?.twitter ? "outline" : "default"}
                                size="sm"
                                onClick={() => handleShare(item, 'twitter')}
                                disabled={processing[`${item.id}-twitter`] || sharedStatus[item.id]?.twitter}
                                className={sharedStatus[item.id]?.twitter ? "text-green-500 border-green-500/20 bg-green-500/10" : "bg-black hover:bg-black/80 text-white"}
                            >
                                {processing[`${item.id}-twitter`] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : sharedStatus[item.id]?.twitter ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Posted
                                    </>
                                ) : (
                                    <>
                                        <Twitter className="w-4 h-4 mr-2" /> Share
                                    </>
                                )}
                            </Button>

                            {/* Facebook Button */}
                            <Button
                                variant={sharedStatus[item.id]?.facebook ? "outline" : "default"}
                                size="sm"
                                onClick={() => handleShare(item, 'facebook')}
                                disabled={processing[`${item.id}-facebook`] || sharedStatus[item.id]?.facebook}
                                className={sharedStatus[item.id]?.facebook ? "text-green-500 border-green-500/20 bg-green-500/10" : "bg-blue-600 hover:bg-blue-700 text-white"}
                            >
                                {processing[`${item.id}-facebook`] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : sharedStatus[item.id]?.facebook ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Posted
                                    </>
                                ) : (
                                    <>
                                        <Facebook className="w-4 h-4 mr-2" /> Share
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
