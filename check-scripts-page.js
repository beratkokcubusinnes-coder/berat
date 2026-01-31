const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Scripts...");
    try {
        const scripts = await prisma.script.findMany({
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            include: { author: true, categoryData: true }
        });
        console.log("Scripts found:", scripts.length);
        if (scripts.length > 0) {
            console.log("First script:", JSON.stringify(scripts[0], null, 2));
        }
    } catch (e) {
        console.error("Error fetching scripts:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
