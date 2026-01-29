import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export default async function Profile({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await getSession();

    if (!session || !session.userId) {
        redirect(`/${lang}/login`);
    }

    // Cast as any if TS still complains, but after generate it should be fine
    const user = await getUserById(session.userId as string) as any;
    
    if (!user) {
        // Session exists but user deleted from DB? Redirect to login.
        redirect(`/${lang}/login`);
    }

    if (!user.username) {
        redirect(`/${lang}/profile/${user.id}`); // Fallback to ID if username missing
    }

    redirect(`/${lang}/profile/${user.username}`);
}
