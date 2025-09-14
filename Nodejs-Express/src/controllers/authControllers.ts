import { Request, Response } from "express"
import { eq } from "drizzle-orm"
import z from "zod"

import { userSchema } from "@/schemas/user"
import { db } from "@/drizzle/db"
import { users } from "@/drizzle/schema"
import { generateRandomBytes, hashString } from "@/utils/auth"
import { setUserSession } from "@/utils/redis"


export const register = async (request: Request, response: Response) => {
    const body = userSchema.safeParse(request.body)

    if (!body.success) {
        if (!body.success) {
            const { properties } = z.treeifyError(body.error)
            response.status(400).json({
                message: "Invalid request body",
                properties
            })
            return
        }
    }

    // Check user exists
    const existingUser = await db.select().from(users).where(eq(users.email, body.data.email)).limit(1)
    if (existingUser.length !== 0) {
        response.status(400).json({ error: "User already exists." })
        return
    }

    // Hash password
    const salt = generateRandomBytes({})
    const hashedPassword = hashString({ salt: salt, str: body.data.password })

    // Create a new user
    const newUser = await db.insert(users).values({
        email: body.data.email,
        password: hashedPassword,
        slat: salt
    }).returning({ id: users.id })

    const sessionId = generateRandomBytes({ length: 512 })

    const setUserSessionResult = await setUserSession({
        sessionId: sessionId, value: {
            userId: newUser[0].id,
            lastSeens: new Date().toISOString(),
            role: "user"
        }
    })

    if (setUserSessionResult) {
        response.status(201).json({
            sessionId: sessionId
        })
    } else {
        response.status(500).json({ error: "Unable to create session." })
        return
    }
}

export const token = async (request: Request, response: Response) => {
    const body = userSchema.safeParse(request.body)

    if (!body.success) {
        if (!body.success) {
            const { properties } = z.treeifyError(body.error)
            response.status(400).json({
                message: "Invalid request body",
                properties
            })
            return
        }
    }

    // Get user from database
    const dbUser = await db.select().from(users).where(eq(users.email, body.data.email)).limit(1)
    if (dbUser.length === 0) {
        response.status(400).json({ error: "User doesn't exist." })
        return
    }

    // Match the password
    const isValidPassword = hashString({ salt: dbUser[0].slat, str: body.data.password }) === dbUser[0].password

    if (!isValidPassword) {
        response.status(400).json({ error: "Password doesn't match." })
        return
    }

    const sessionId = generateRandomBytes({ length: 512 })

    const setUserSessionResult = await setUserSession({
        sessionId: sessionId, value: {
            userId: dbUser[0].id,
            lastSeens: new Date().toISOString(),
            role: "user"
        }
    })

    if (setUserSessionResult) {
        response.status(201).json({
            sessionId: sessionId
        })
    } else {
        response.status(500).json({ error: "Unable to create session." })
        return
    }
}