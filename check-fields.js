const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Check if 'image' is in the metadata
        const model = prisma._baseDmmf.modelMap.Prompt;
        console.log("Prompt model fields:", model.fields.map(f => f.name).join(", "));
    } catch (e) {
        console.error("Error checking model:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
