'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveSocialCredentials } from '@/actions/social-share';
import { toast } from 'sonner';
import { Loader2, Save, Twitter, Facebook } from 'lucide-react';

export function SocialSettings({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await saveSocialCredentials(formData);
            toast.success('Credentials saved successfully');
        } catch (e) {
            toast.error('Failed to save credentials');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            {/* Twitter Section */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-lg">Twitter (X) API Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>API Key (Consumer Key)</Label>
                        <Input
                            name="twitter_api_key"
                            defaultValue={initialData.twitter_api_key}
                            placeholder="To get this, create an App on developer.twitter.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>API Secret (Consumer Secret)</Label>
                        <Input
                            name="twitter_api_secret"
                            type="password"
                            defaultValue={initialData.twitter_api_secret}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Access Token</Label>
                        <Input
                            name="twitter_access_token"
                            defaultValue={initialData.twitter_access_token}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Access Token Secret</Label>
                        <Input
                            name="twitter_access_secret"
                            type="password"
                            defaultValue={initialData.twitter_access_secret}
                        />
                    </div>
                </div>
            </div>

            {/* Facebook Section */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg">Facebook API Settings</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Page ID</Label>
                        <Input
                            name="facebook_page_id"
                            defaultValue={initialData.facebook_page_id}
                            placeholder="Numeric ID of your Facebook Page"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Page Access Token (Long-lived)</Label>
                        <Input
                            name="facebook_access_token"
                            type="password"
                            defaultValue={initialData.facebook_access_token}
                            placeholder="EAAG..."
                        />
                        <p className="text-xs text-muted-foreground">
                            You can get this from the Meta for Developers Graph API Explorer. Ensure you have 'pages_manage_posts' permission.
                        </p>
                    </div>
                </div>
            </div>


            {/* Medium Section */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white font-serif font-bold text-xs">M</div>
                    <h3 className="font-bold text-lg">Medium API Settings</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Integration Token</Label>
                        <Input
                            name="medium_integration_token"
                            type="password"
                            defaultValue={initialData.medium_integration_token}
                            placeholder="Get this from Medium Settings > Integration Tokens"
                        />
                        <p className="text-xs text-muted-foreground">
                            Create a token at <a href="https://medium.com/me/settings/security" target="_blank" className="underline hover:text-primary">Medium Settings</a>.
                        </p>
                    </div>
                </div>
            </div>


            {/* LinkedIn Section */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                    <div className="w-5 h-5 bg-blue-700 rounded-sm flex items-center justify-center text-white font-bold text-xs">in</div>
                    <h3 className="font-bold text-lg">LinkedIn API Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Access Token (OAuth2)</Label>
                        <Input
                            name="linkedin_access_token"
                            type="password"
                            defaultValue={initialData.linkedin_access_token}
                            placeholder="Get from LinkedIn Developer Portal"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Person URN (ID)</Label>
                        <Input
                            name="linkedin_person_urn"
                            defaultValue={initialData.linkedin_person_urn}
                            placeholder="e.g. 123456789 (Use /me endpoint to find)"
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Connections
            </Button>
        </form>
    );
}
