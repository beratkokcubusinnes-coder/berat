import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Replaces the JWT encryption with database session creation
export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // 1. Get user to find current sessionVersion
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { sessionVersion: true }
    })

    if (!user) throw new Error("User not found")

    // 2. Create session in DB
    // We use crypto.randomUUID() for a secure session ID
    const sessionId = crypto.randomUUID();

    await prisma.session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt,
            sessionVersion: user.sessionVersion,
        }
    })

    // 3. Set Cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
        priority: 'high'
    })
}

export async function getSession() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) return null

    try {
        // 1. Fetch Session & User with necessary fields
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        sessionVersion: true,
                        banned: true,
                        // Include other fields consumers might expect if they relied on the JWT payload
                        email: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        // 2. Validate Session Existence
        if (!session) {
            return null
        }

        // 3. Check Expiration
        if (Date.now() > session.expiresAt.getTime()) {
            await deleteSession()
            return null
        }

        // 4. Check Session Version & Ban Status
        // This ensures if user password changed or is banned, session is invalid
        if (session.sessionVersion !== session.user.sessionVersion || session.user.banned) {
            await deleteSession()
            return null
        }

        // Return a shape compatible with what the app expects
        return {
            userId: session.userId,
            role: session.user.role,
            user: session.user,
            // Spread user props for backward compatibility if code accessed session.email etc directly
            email: session.user.email,
            username: session.user.username,
            name: session.user.name,
            avatar: session.user.avatar
        }
    } catch (error) {
        console.error("Session error:", error)
        return null
    }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (sessionId) {
        try {
            await prisma.session.delete({ where: { id: sessionId } })
        } catch { }
    }

    cookieStore.delete('session')
}

// Helper to update session version (e.g. on password change)
export async function invalidateAllSessions(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { sessionVersion: { increment: 1 } }
    })
}
