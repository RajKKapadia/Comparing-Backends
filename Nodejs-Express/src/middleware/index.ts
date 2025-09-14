import { validateUserSession } from "@/utils/redis";
import { Request, Response, NextFunction } from "express"

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

export const authenticateToken = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const authHeader = request.headers["authorization"]
    const sessionId = authHeader && authHeader.split(" ")[1]
    if (!sessionId) {
        response.status(401).json({ error: "SessionId required." });
        return
    }
    try {
        const userId = await validateUserSession({ sessionId: sessionId })
        if (userId) {
            request.userId = userId
            next()
        } else {
            response.status(403).json({ error: "Invalid or expired token." });
            return
        }
    } catch (error) {
        response.status(403).json({ error: "Invalid or expired token." });
        return
    }
}