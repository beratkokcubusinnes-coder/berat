const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const prompt = await prisma.prompt.findFirst();
        console.log("Found prompt:", prompt);
    } catch (e) {
        console.error("Query failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
