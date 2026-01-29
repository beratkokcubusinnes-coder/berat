const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const user = await prisma.user.upsert({
            where: { email: 'berat@promptda.com' },
            update: {
                role: 'admin'
            },
            create: {
                email: 'berat@promptda.com',
                username: 'berat_memisoglu',
                name: 'Berat Memisoglu',
                password: hashedPassword,
                role: 'admin',
                bio: 'Admin & Founder',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=berat'
            }
        });

        console.log('✅ Admin user created/updated:', {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        });

        console.log('\n🔑 Login credentials:');
        console.log('Email: berat@promptda.com');
        console.log('Password: admin123');
        console.log('Username: berat_memisoglu');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
