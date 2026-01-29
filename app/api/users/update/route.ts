import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const id = formData.get("id") as string;

        if (!id) {
            return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
        }

        let avatarPath = formData.get("avatar") as string | File;

        // Handle File Upload
        if (avatarPath instanceof File) {
            const file = avatarPath;
            if (file.size > 0 && file.name) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Create unique filename
                const ext = path.extname(file.name) || ".jpg";
                const filename = `avatar-${id}-${Date.now()}${ext}`;
                const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
                const filePath = path.join(uploadDir, filename);

                // Save file
                await writeFile(filePath, buffer);
                avatarPath = `/uploads/avatars/${filename}`;
            } else {
                // If file is empty, exclude it from update or keep existing
                // Here we'll just check if we have a string URL from a hidden input potentially, or just ignore
                // But formData.get("avatar") returns the file object if a file input exists even if empty.
                // We will handle this logic: IF file is uploaded, use it. ELSE keep existing.
                // Since we rely on what's sent, client should manage this.
                // For now, if it's an empty file object, we fallback to existing user avatar or ignore.
                // In this implementation, let's assume if it's a File and size is 0, we don't update avatar.
                avatarPath = undefined as any;
            }
        }

        const data: any = {
            name: formData.get("name"),
            username: formData.get("username"),
            email: formData.get("email"),
            bio: formData.get("bio"),
            location: formData.get("location"),
            role: formData.get("role"),
            banned: formData.get("banned") === "true",
            banReason: formData.get("banReason") || null,
            warnings: parseInt(formData.get("warnings") as string || "0"),
        };

        if (typeof avatarPath === 'string' && avatarPath.length > 0) {
            data.avatar = avatarPath;
        }

        // Check if username/email already exists for OTHER users
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email }
                ],
                NOT: {
                    id: id
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Username or email already taken by another user" }, { status: 400 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
