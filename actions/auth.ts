'use server'

import { z } from 'zod'
import { createUser, getUserByEmail } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export type AuthState = {
    errors?: Record<string, string[]>
    message?: string
    success?: boolean
}

const RegisterSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const parsedData = Object.fromEntries(formData);
    const result = RegisterSchema.safeParse(parsedData)

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        }
    }

    const { name, email, password } = result.data

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
        return {
            errors: {
                email: ['Email already in use.'],
            },
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser({
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: hashedPassword,
    })

    await createSession(user.id)
    return { success: true }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const result = LoginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            message: 'Invalid input'
        }
    }

    const { email, password } = result.data

    const user = await getUserByEmail(email)
    if (!user) {
        return {
            message: 'Invalid email or password'
        }
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        return {
            message: 'Invalid email or password'
        }
    }

    await createSession(user.id)
    return { success: true }
}

export async function logout() {
    await deleteSession()
    redirect('/')
}
