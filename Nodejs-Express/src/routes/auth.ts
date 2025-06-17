import { NextFunction, Router, Request, Response } from "express"
import { z } from "zod"

import { register, login } from "../controllers/authController"

const userSchema = z.object({
    email: z.string().email("Email is required."),
    password: z.string().min(1, "Password is required.")
})

const validateUser = (req: Request, res: Response, next: NextFunction) => {
    const result = userSchema.safeParse(req.body)
    if (!result.success) {
        const requiredFields = Object.keys(userSchema.shape)
        return res.status(400).json({
            message: `Required fields: ${requiredFields.join(", ")}`,
        })
    }
    req.body = result.data
    next()
}

const router: Router = Router()

router.post("/register", validateUser, register)
router.post("/token", validateUser, login)

export default router
