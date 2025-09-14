import { NextFunction, Router, Request, Response } from "express"

import { userSchema } from "@/schemas/user"
import { register, token } from "@/controllers/authControllers"
import z from "zod"

const router = Router()

const validateUser = (request: Request, response: Response, next: NextFunction): void => {
    const result = userSchema.safeParse(request.body)
    if (!result.success) {
        const { properties } = z.treeifyError(result.error)
        response.status(400).json({
            message: "Invalid request body",
            properties
        })
        return
    }
    next()
}

router.post("/register", validateUser, register)
router.post("/token", validateUser, token)

export default router
