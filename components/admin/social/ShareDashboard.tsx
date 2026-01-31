'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { shareToTwitter, shareToFacebook, shareToMedium, shareToLinkedin, shareToTumblr } from '@/actions/social-share';
import { toast } from 'sonner';
import { Twitter, Facebook, Loader2, ExternalLink, Calendar, CheckCircle2, AlertCircle, BookOpen, Linkedin, Share2 } from 'lucide-react';
import Link from 'next/link';

interface ContentItem {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    type: 'prompt' | 'blog';
    image?: string;
}

export function ShareDashboard({ items, baseUrl }: { items: ContentItem[], baseUrl: string }) {
    const [processing, setProcessing] = useState<Record<string, boolean>>({});

    // Track shared status simply in local state for this session (could be persisted in DB ideally)
    const [sharedStatus, setSharedStatus] = useState<Record<string, { twitter?: boolean, facebook?: boolean, medium?: boolean, linkedin?: boolean, tumblr?: boolean }>>({});

    const handleShare = async (item: ContentItem, platform: 'twitter' | 'facebook' | 'medium' | 'linkedin' | 'tumblr') => {
        const key = `${item.id}-${platform}`;
        setProcessing(p => ({ ...p, [key]: true }));

        const url = `${baseUrl}/${item.type === 'prompt' ? 'prompts' : 'blog'}/${item.slug}`;
        const message = `Check out this new ${item.type}: ${item.title}`;

        try {
            let result;
            if (platform === 'twitter') {
                result = await shareToTwitter(item.id, item.type, message, url);
            } else if (platform === 'facebook') {
                result = await shareToFacebook(item.id, item.type, message, url);
            } else if (platform === 'medium') {
                result = await shareToMedium(item.id, item.type, item.title, url);
            } else if (platform === 'linkedin') {
                result = await shareToLinkedin(item.id, item.type, message, url);
            } else if (platform === 'tumblr') {
                result = await shareToTumblr(item.id, item.type, item.title, url);
            }

            if (result && result.success) {
                toast.success(`Shared to ${platform} successfully!`);
                setSharedStatus(prev => ({
                    ...prev,
                    [item.id]: {
                        ...prev[item.id],
                        [platform]: true
                    }
                }));
            } else {
                toast.error(`Failed to share: ${result?.error}`);
            }
        } catch (e) {
            toast.error('Unexpected error sharing content');
        } finally {
            setProcessing(p => ({ ...p, [key]: false }));
        }
    };

    const handleManualShare = (item: ContentItem, platform: 'tumblr' | 'pearltrees') => {
        const url = `${baseUrl}/${item.type === 'prompt' ? 'prompts' : 'blog'}/${item.slug}`;
        let shareUrl = "";

        if (platform === 'tumblr') {
            shareUrl = `https://www.tumblr.com/widgets/share/tool?posttype=link&title=${encodeURIComponent(item.title)}&caption=${encodeURIComponent(item.title)}&content=${encodeURIComponent(url)}&canonicalUrl=${encodeURIComponent(url)}&shareSource=tumblr_share_button`;
        } else if (platform === 'pearltrees') {
            // Pearltrees doesn't have a direct "share link" param set official docs, but acting as a bookmarklet usually works via main site or extension.
            // Using a generic intent-like structure or redirecting to main site.
            // Actually, best bet is their web clipper.
            // Let's use a known structure if available, otherwise just copy link toast.
            // Pearltrees URL scheme is elusive. Let's trying copying link + toast.
            navigator.clipboard.writeText(url);
            toast.success("Link copied! Open Pearltrees to add.", { duration: 4000 });
            window.open('https://www.pearltrees.com', '_blank');
            return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=500');
        }
    };

    const handleSemiAutoShare = (item: ContentItem, platform: 'pinterest' | 'reddit' | 'telegram') => {
        const url = `${baseUrl}/${item.type === 'prompt' ? 'prompts' : 'blog'}/${item.slug}`;
        let shareUrl = "";

        if (platform === 'pinterest') {
            shareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(item.image || '')}&description=${encodeURIComponent(item.title)}`;
        } else if (platform === 'reddit') {
            shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(item.title)}`;
        } else if (platform === 'telegram') {
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(item.title)}`;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=800,height=600');
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
                    <div key={item.id} className="bg-card border border-border p-4 rounded-xl flex flex-col items-start gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
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
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full pt-2 border-t border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground mr-2">Auto-Post:</span>
                            {/* Twitter Button */}
                            <Button
                                variant={sharedStatus[item.id]?.twitter ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => handleShare(item, 'twitter')}
                                disabled={processing[`${item.id}-twitter`] || sharedStatus[item.id]?.twitter}
                                className={sharedStatus[item.id]?.twitter ? "text-green-500 h-8" : "bg-black hover:bg-black/80 text-white h-8 text-xs"}
                            >
                                {processing[`${item.id}-twitter`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Twitter className="w-3 h-3 mr-1" />}
                                {sharedStatus[item.id]?.twitter ? 'Done' : 'Twitter'}
                            </Button>

                            {/* Facebook Button */}
                            <Button
                                variant={sharedStatus[item.id]?.facebook ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => handleShare(item, 'facebook')}
                                disabled={processing[`${item.id}-facebook`] || sharedStatus[item.id]?.facebook}
                                className={sharedStatus[item.id]?.facebook ? "text-green-500 h-8" : "bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"}
                            >
                                {processing[`${item.id}-facebook`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Facebook className="w-3 h-3 mr-1" />}
                                {sharedStatus[item.id]?.facebook ? 'Done' : 'Facebook'}
                            </Button>

                            {/* Medium Button */}
                            <Button
                                variant={sharedStatus[item.id]?.medium ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => handleShare(item, 'medium')}
                                disabled={processing[`${item.id}-medium`] || sharedStatus[item.id]?.medium}
                                className={sharedStatus[item.id]?.medium ? "text-green-500 h-8" : "bg-zinc-800 hover:bg-zinc-900 text-white h-8 text-xs"}
                            >
                                {processing[`${item.id}-medium`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3 mr-1" />}
                                {sharedStatus[item.id]?.medium ? 'Done' : 'Medium'}
                            </Button>

                            {/* LinkedIn Button */}
                            <Button
                                variant={sharedStatus[item.id]?.linkedin ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => handleShare(item, 'linkedin')}
                                disabled={processing[`${item.id}-linkedin`] || sharedStatus[item.id]?.linkedin}
                                className={sharedStatus[item.id]?.linkedin ? "text-green-500 h-8" : "bg-blue-700 hover:bg-blue-800 text-white h-8 text-xs"}
                            >
                                {processing[`${item.id}-linkedin`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Linkedin className="w-3 h-3 mr-1" />}
                                {sharedStatus[item.id]?.linkedin ? 'Done' : 'LinkedIn'}
                            </Button>

                            {/* Tumblr Button (Auto) */}
                            <Button
                                variant={sharedStatus[item.id]?.tumblr ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => handleShare(item, 'tumblr')}
                                disabled={processing[`${item.id}-tumblr`] || sharedStatus[item.id]?.tumblr}
                                className={sharedStatus[item.id]?.tumblr ? "text-green-500 h-8" : "bg-[#36465D] hover:bg-[#36465D]/90 text-white h-8 text-xs"}
                            >
                                {processing[`${item.id}-tumblr`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="font-bold mr-1">t</span>}
                                {sharedStatus[item.id]?.tumblr ? 'Done' : 'Tumblr'}
                            </Button>

                            <div className="w-px h-6 bg-border mx-2"></div>

                            <span className="text-xs font-semibold text-muted-foreground mr-2">Semi-Auto:</span>

                            {/* Pinterest */}
                            <Button variant="outline" size="sm" className="h-8 text-xs border-red-500/20 hover:bg-red-500 hover:text-white" onClick={() => handleSemiAutoShare(item, 'pinterest')}>
                                Pinterest
                            </Button>

                            {/* Reddit */}
                            <Button variant="outline" size="sm" className="h-8 text-xs border-orange-500/20 hover:bg-orange-500 hover:text-white" onClick={() => handleSemiAutoShare(item, 'reddit')}>
                                Reddit
                            </Button>

                            {/* Telegram */}
                            <Button variant="outline" size="sm" className="h-8 text-xs border-sky-500/20 hover:bg-sky-500 hover:text-white" onClick={() => handleSemiAutoShare(item, 'telegram')}>
                                Telegram
                            </Button>

                            <div className="w-px h-6 bg-border mx-2"></div>

                            <span className="text-xs font-semibold text-muted-foreground mr-2">Manual:</span>

                            {/* Pearltrees Manual */}
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleManualShare(item, 'pearltrees')}>
                                <Share2 className="w-3 h-3 mr-1" /> Pearltrees
                            </Button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
