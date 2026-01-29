const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Start seeding...')

    try {
        // 1. Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10)

        let user = await prisma.user.findFirst({ where: { email: 'admin@promptda.com' } })
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'admin@promptda.com',
                    username: 'admin_user',
                    name: 'Admin User',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                    role: 'admin',
                    password: hashedPassword,
                },
            })
            console.log('✅ Created admin user (admin@promptda.com / admin123)')
        } else {
            console.log('ℹ️  Admin user already exists')
        }

        console.log('✅ Seeding finished!')
    } catch (error) {
        console.error('❌ Seeding error:', error.message)
        throw error
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
