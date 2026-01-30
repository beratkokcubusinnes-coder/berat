import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { Users as UsersIcon, UserPlus, Shield, AlertTriangle, Ban, Edit } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { UsersFilterBar } from "@/components/admin/UsersFilterBar";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import UserAvatar from "@/components/ui/UserAvatar";
import { UserActionButtons } from "@/components/admin/UserActionButtons";

export const metadata: Metadata = {
    title: "User Management | Admin Panel",
    description: "Manage users, permissions, and moderation",
};

export default async function AdminUsersPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ search?: string; role?: string; banned?: string }>;
}) {
    const { lang } = await params;
    const { search, role, banned } = await searchParams;
    const dict = await getDictionary(lang);

    // Build filter query
    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { username: { contains: search } }
        ];
    }

    if (role && role !== "all") {
        where.role = role;
    }

    if (banned === "true") {
        where.banned = true;
    } else if (banned === "false") {
        where.banned = false;
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

    const stats = {
        total: await prisma.user.count(),
        admins: await prisma.user.count({ where: { role: 'admin' } }),
        banned: await prisma.user.count({ where: { banned: true } }),
        warned: await prisma.user.count({ where: { warnings: { gt: 0 } } })
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage users, permissions, and moderation</p>
                </div>
                <Link
                    href={`/${lang}/admin/users/new`}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-start"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Total Users</span>
                    </div>
                    <div className="text-3xl font-black">{stats.total}</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-muted-foreground">Admins</span>
                    </div>
                    <div className="text-3xl font-black">{stats.admins}</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Warned</span>
                    </div>
                    <div className="text-3xl font-black">{stats.warned}</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Ban className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-muted-foreground">Banned</span>
                    </div>
                    <div className="text-3xl font-black">{stats.banned}</div>
                </div>
            </div>

            {/* Filters */}
            <UsersFilterBar lang={lang} />

            {/* Users Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Content</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                src={user.avatar}
                                                alt={user.name || user.username}
                                                size={40}
                                            />
                                            <div>
                                                <div className="font-bold text-sm">{user.name || user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-500'
                                            : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <span className="font-bold">{user._count.prompts + user._count.scripts + user._count.hooks + user._count.blogPosts}</span>
                                            <span className="text-muted-foreground ml-1">items</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.banned ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 w-fit">
                                                    <Ban className="w-3 h-3" />
                                                    Banned
                                                </span>
                                                {user.banReason && (
                                                    <span className="text-xs text-muted-foreground">{user.banReason}</span>
                                                )}
                                            </div>
                                        ) : user.warnings > 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                                                <AlertTriangle className="w-3 h-3" />
                                                {user.warnings} warning{user.warnings > 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/${lang}/admin/users/edit/${user.id}`}
                                                className="p-2 hover:bg-muted rounded-lg transition-all"
                                                title="Edit user"
                                            >
                                                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </Link>
                                            <UserActionButtons user={user} />
                                            <DeleteUserButton userId={user.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No users found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
}
