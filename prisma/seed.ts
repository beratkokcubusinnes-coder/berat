
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create a User (if not exists)
    let user = await prisma.user.findFirst({ where: { email: 'admin@promptda.com' } })
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'admin@promptda.com',
                username: 'admin_user',
                name: 'Admin User',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                role: 'ADMIN',
                password: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Dummy hash
            },
        })
        console.log('Created user:', user.name)
    }

    // 2. Create Categories (if not exists)
    const categories = [
        { name: 'Photography', slug: 'photography', type: 'prompt' },
        { name: 'Portrait', slug: 'portrait', type: 'prompt' },
        { name: 'Architecture', slug: 'architecture', type: 'prompt' },
        { name: 'Fashion', slug: 'fashion', type: 'prompt' },
        { name: '3D Render', slug: '3d-render', type: 'prompt' },
    ]

    for (const cat of categories) {
        const existing = await prisma.category.findFirst({ where: { slug: cat.slug, type: cat.type } })
        if (!existing) {
            await prisma.category.create({ data: cat })
            console.log('Created category:', cat.name)
        }
    }

    // 3. Create Featured Prompts
    const prompts = [
        {
            title: "Neon Cyberpunk Cityscape",
            slug: "neon-cyberpunk-cityscape",
            content: "A futuristic city at night, neon lights, rain-slicked streets, towering skyscrapers, cyberpunk aesthetic, detailed textures, 8k resolution --ar 16:9",
            description: "Generate stunning cyberpunk cityscapes with high detail.",
            model: "Midjourney v6",
            category: "Architecture",
            images: "https://images.unsplash.com/photo-1515630278258-407f66498911,https://images.unsplash.com/photo-1515630278258-407f66498911",
            isFeatured: true,
            authorId: user.id
        },
        {
            title: "Hyper-Realistic Portrait",
            slug: "hyper-realistic-portrait",
            content: "Close-up portrait of an elderly man, weathered face, intense eyes, natural lighting, bokeh background, shot on 85mm lens --v 6.0",
            description: "Create lifelike portraits with incredible texture details.",
            model: "Midjourney v6",
            category: "Portrait",
            images: "https://images.unsplash.com/photo-1544005313-94ddf0286df2,https://images.unsplash.com/photo-1544005313-94ddf0286df2",
            isFeatured: true,
            authorId: user.id
        },
        {
            title: "Minimalist Logo Design",
            slug: "minimalist-logo-design",
            content: "Minimalist vector logo, geometric fox head, orange and white, flat design, white background",
            description: "Clean and modern logo designs suitable for tech startups.",
            model: "DALL-E 3",
            category: "3D Render",
            images: "https://images.unsplash.com/photo-1626785774573-4b799314346d,https://images.unsplash.com/photo-1626785774573-4b799314346d",
            isFeatured: true,
            authorId: user.id
        },
        {
            title: "Fashion Editorial Shoot",
            slug: "fashion-editorial-shoot",
            content: "High fashion photography, avant-garde outfit, dramatic lighting, studio setting, dynamic pose, vogue style --ar 2:3",
            description: "Capture high-end fashion photography styles.",
            model: "Stable Diffusion XL",
            category: "Fashion",
            images: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956,https://images.unsplash.com/photo-1539008835657-9e8e9680c956",
            isFeatured: true,
            authorId: user.id
        },
        {
            title: "Cinematic Movie Scene",
            slug: "cinematic-movie-scene",
            content: "Cinematic shot, brave knight facing a dragon, epic scale, volumetric lighting, smoke and fire particles, movie still, color graded --ar 2.39:1",
            description: "Create movie-like scenes with dramatic composition.",
            model: "Midjourney v6",
            category: "Photography",
            images: "https://images.unsplash.com/photo-1536440136628-849c177e76a1,https://images.unsplash.com/photo-1536440136628-849c177e76a1",
            isFeatured: true, // This one is featured too
            authorId: user.id
        }
    ]

    for (const p of prompts) {
        const existing = await prisma.prompt.findUnique({ where: { slug: p.slug } })
        if (!existing) {
            // Find category ID
            const cat = await prisma.category.findFirst({ where: { slug: p.category.toLowerCase().replace(' ', '-'), type: 'prompt' } })

            // Destructure to separate isFeatured from other fields
            const { isFeatured, ...promptData } = p;

            await prisma.prompt.create({
                data: {
                    ...promptData,
                    categoryId: cat?.id || null,
                    status: "APPROVED",
                    isFeatured: isFeatured || false
                }
            })
            console.log(`Created prompt: ${p.title}`)
        } else {
            // Ensure it's featured
            await prisma.prompt.update({
                where: { id: existing.id },
                data: { isFeatured: true, status: "APPROVED" }
            })
            console.log(`Updated prompt to featured: ${p.title}`)
        }
    }

    console.log('Seeding finished.')
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
