const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const promptCount = await prisma.prompt.count();
    const scriptCount = await prisma.script.count();
    const hookCount = await prisma.hook.count();
    const toolCount = await prisma.tool.count();

    console.log({
        userCount,
        promptCount,
        scriptCount,
        hookCount,
        toolCount
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
