const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            _count: {
                select: {
                    prompts: true,
                    scripts: true,
                    hooks: true
                }
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
