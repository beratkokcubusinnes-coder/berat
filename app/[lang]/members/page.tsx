import { getDictionary } from "@/lib/dictionary";
import { getSession } from "@/lib/session";
import { getUsers } from "@/lib/db";
import MembersPage from "@/components/members/MembersPage";

export default async function Members({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSession();
    const users = await getUsers();

    return <MembersPage users={users} currentUser={session} lang={lang} dict={dict} />;
}
