import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import { notFound } from "next/navigation";
import { UserEditForm } from "@/components/admin/UserEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit User | Admin Panel",
    description: "Update user profile and permissions",
};

export default async function EditUserPage({
    params
}: {
    params: Promise<{ lang: string; id: string }>
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    prompts: true,
                    scripts: true,
                    hooks: true,
                    blogPosts: true
                }
            }
        }
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <Link
                    href={`/${lang}/admin/users`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </Link>
                <div className="flex items-center gap-4">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || user.username}
                            className="w-16 h-16 rounded-full object-cover border-4 border-card shadow-lg"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-card shadow-lg">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Updating profile for <span className="font-bold text-foreground">{user.name || user.username}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <UserEditForm user={user} lang={lang} />
        </div>
    );
}
