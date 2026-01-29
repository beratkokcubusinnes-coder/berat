const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'berat_kvrkq7';

    try {
        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            console.log(`❌ User with username "${username}" not found.`);
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { username: username },
            data: { role: 'admin' }
        });

        console.log(`✅ User "${username}" has been promoted to admin.`);
        console.log({
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role
        });
    } catch (error) {
        console.error('❌ Error updating user role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
