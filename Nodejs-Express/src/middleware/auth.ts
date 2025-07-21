import { Request, Response, NextFunction, RequestHandler } from "express"

import { verifyToken } from "../utils/jwt"

export interface AuthRequest extends Request {
    user?: {
        userId: number
        email: string
    }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
}
