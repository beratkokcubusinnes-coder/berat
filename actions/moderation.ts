'use server';

import { revalidatePath } from 'next/cache';
import { approvePrompt, rejectPrompt } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getUserById } from '@/lib/db';

async function checkAdmin() {
    const session = await getSession();
    if (!session || !session.userId) return false;
    const user = await getUserById(session.userId as string);
    return user?.role === 'admin';
}

export async function handleApprovePrompt(id: string, lang: string) {
    if (!await checkAdmin()) return { success: false, message: "Unauthorized" };

    try {
        await approvePrompt(id);
        revalidatePath(`/${lang}/admin/approvals`);
        revalidatePath(`/${lang}/prompts`);
        revalidatePath('/');
        return { success: true };
    } catch (err) {
        return { success: false, message: "Failed to approve" };
    }
}

export async function handleRejectPrompt(id: string, lang: string) {
    if (!await checkAdmin()) return { success: false, message: "Unauthorized" };

    try {
        await rejectPrompt(id);
        revalidatePath(`/${lang}/admin/approvals`);
        return { success: true };
    } catch (err) {
        return { success: false, message: "Failed to reject" };
    }
}
