import Redis from "ioredis"

import { env } from "@/utils/env"
import { SessionValues } from "@/schemas/user"

const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
})

const TTL = 86400

export const getUserSession = async ({ sessionId }: { sessionId: string }): Promise<SessionValues | null> => {
    const value = await redis.get(sessionId)
    if (value) {
        return JSON.parse(value) as SessionValues
    } else {
        return null
    }
}

export const deleteUserSession = async ({ sessionId }: { sessionId: string }): Promise<boolean> => {
    try {
        await redis.del(sessionId)
        return true
    } catch (error) {
        console.log("Error at deleteUserSession:")
        console.error(error)
        return false
    }
}

export const setUserSession = async ({ sessionId, value }: { sessionId: string, value: SessionValues }): Promise<boolean> => {
    try {
        await redis.set(
            sessionId, JSON.stringify(value), "EX", TTL
        )
        return true
    } catch (error) {
        console.log("Error at setUserSession:")
        console.error(error)
        return false
    }
}

export const updateUserSession = async ({ sessionId }: { sessionId: string }): Promise<boolean> => {
    try {
        const sessionValues = await getUserSession({ sessionId: sessionId })
        if (sessionValues) {
            const now = new Date().toISOString()
            sessionValues.lastSeens = now
            await redis.set(
                sessionId, JSON.stringify(sessionValues), "EX", TTL
            )
            return true
        }
        return false
    } catch (error) {
        console.log("Error at updateUserSession:")
        console.error(error)
        return false
    }
}

export const validateUserSession = async ({ sessionId }: { sessionId: string }): Promise<string | null> => {
    try {
        const sessionValues = await getUserSession({ sessionId: sessionId })
        if (sessionValues) {
            const lastSeens = new Date(Date.parse(sessionValues.lastSeens))
            const now = new Date()
            const diffSeconds = Math.abs(now.getTime() - lastSeens.getTime()) / 1000
            if (diffSeconds <= TTL) {
                return sessionValues.userId
            }
            return null
        }
        return null
    } catch (error) {
        console.log("Error at validateUserSession:")
        console.error(error)
        return null
    }
}