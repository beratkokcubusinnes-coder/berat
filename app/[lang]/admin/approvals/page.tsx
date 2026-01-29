import { getPendingPrompts } from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { Check, X, Eye, User, Calendar, Tag } from "lucide-react";
import { handleApprovePrompt, handleRejectPrompt } from "@/actions/moderation";
import { revalidatePath } from "next/cache";

export default async function ApprovalsPage({ params }: { params: any }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const pendingPrompts = await getPendingPrompts();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">{dict.Admin.approvals || "Waiting List"}</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">Review and approve user submitted prompts</p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                    <span className="text-primary font-black text-sm">{pendingPrompts.length} Pending Prompts</span>
                </div>
            </div>

            {pendingPrompts.length === 0 ? (
                <div className="bg-card/50 border border-border border-dashed rounded-[2rem] py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Clean Slate!</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">No pending prompts discovered. Everything is up to date.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingPrompts.map((prompt: any) => (
                        <div key={prompt.id} className="bg-card/50 border border-border/50 rounded-3xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                {/* Preview Image if exists */}
                                {prompt.beforeImage && (
                                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 border border-border">
                                        <img src={prompt.beforeImage} className="w-full h-full object-cover" alt="" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{prompt.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    {prompt.author?.name || 'Unknown'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    {prompt.category} • {prompt.model}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(prompt.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
                                        "{prompt.description}"
                                    </p>

                                    <div className="bg-muted/30 rounded-2xl p-4 font-mono text-xs text-muted-foreground border border-border/50 max-h-24 overflow-y-auto">
                                        {prompt.content}
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center">
                                    <form action={async () => {
                                        'use server';
                                        await handleApprovePrompt(prompt.id, lang);
                                    }}>
                                        <button className="w-full md:w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20" title="Approve">
                                            <Check className="w-6 h-6" />
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        'use server';
                                        await handleRejectPrompt(prompt.id, lang);
                                    }}>
                                        <button className="w-full md:w-12 h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20" title="Reject">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </form>
                                    <button className="w-full md:w-12 h-12 rounded-xl bg-muted/50 text-muted-foreground hover:bg-foreground hover:text-background transition-all flex items-center justify-center border border-border" title="View Details">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
