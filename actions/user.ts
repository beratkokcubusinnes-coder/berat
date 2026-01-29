'use server'

import { getSession, createSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import path from "path"
import { join } from "path"

export async function updateProfile(formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const username = formData.get("username") as string
    const bio = formData.get("bio") as string
    const location = formData.get("location") as string
    const avatarFile = formData.get("avatar") as File
    const coverFile = formData.get("coverImage") as File

    let avatarUrl = undefined
    let coverUrl = undefined

    // Handle Avatar Upload
    if (avatarFile && avatarFile.size > 0) {
        if (!avatarFile.type.startsWith("image/")) {
            return { error: "Invalid file type for avatar." }
        }
        try {
            const bytes = await avatarFile.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const ext = path.extname(avatarFile.name) || ".png"
            const filename = `avatar-${session.userId}-${Date.now()}${ext}`
            const uploadDir = join(process.cwd(), "public", "uploads", "avatars")
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            avatarUrl = `/uploads/avatars/${filename}`
        } catch (error) {
            console.error("Avatar upload error:", error)
        }
    }

    // Handle Cover Upload
    if (coverFile && coverFile.size > 0) {
        if (!coverFile.type.startsWith("image/")) {
            return { error: "Invalid file type for cover image." }
        }
        try {
            const bytes = await coverFile.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const ext = path.extname(coverFile.name) || ".png"
            const filename = `cover-${session.userId}-${Date.now()}${ext}`
            const uploadDir = join(process.cwd(), "public", "uploads", "covers")
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            coverUrl = `/uploads/covers/${filename}`
        } catch (error) {
            console.error("Cover upload error:", error)
        }
    }

    try {
        const updateData: any = {
            name,
            username,
            bio,
            location,
            updatedAt: new Date()
        }

        if (avatarUrl) updateData.avatar = avatarUrl
        if (coverUrl) updateData.coverImage = coverUrl


        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData
        })


        revalidatePath("/")

        return { success: true, user: updatedUser }
    } catch (error) {
        console.error("Profile update error:", error)
        return { error: "Failed to update profile" }
    }
}
