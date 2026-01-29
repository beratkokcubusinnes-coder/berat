const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const users = [
        {
            id: 'user1',
            email: 'alice@example.com',
            username: 'alice',
            name: 'Alice Designer',
            password,
            bio: 'UI/UX enthusiast and Midjourney master.',
            location: 'Berlin, Germany',
            role: 'user'
        },
        {
            id: 'user2',
            email: 'bob@example.com',
            username: 'bob',
            name: 'Bob Promptist',
            password,
            bio: 'Focusing on photorealistic DALL-E 3 prompts.',
            location: 'New York, USA',
            role: 'user'
        },
        {
            id: 'user3',
            email: 'charlie@example.com',
            username: 'charlie',
            name: 'Charlie Admin',
            password,
            bio: 'System administrator and AI researcher.',
            location: 'London, UK',
            role: 'admin'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: { username: user.username },
            create: user,
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
