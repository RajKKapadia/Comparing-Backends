import { NextFunction, Router, Request, Response } from "express"

import { z } from "zod"

import { authenticateToken } from "../middleware/auth"
import {
    createBookmark,
    getUserBookmarks,
    getBookmark,
    deleteBookmark
} from "../controllers/bookmarkController"

const bookmarkSchema = z.object({
    title: z.string().min(1, "Title is required."),
    url: z.string().min(1, "URL is required.")
})

const validateBookmark = (req: Request, res: Response, next: NextFunction) => {
    const result = bookmarkSchema.safeParse(req.body)
    if (!result.success) {
        const requiredFields = Object.keys(bookmarkSchema.shape)
        return res.status(400).json({
            message: `Required fields: ${requiredFields.join(", ")}`,
        })
    }
    req.body = result.data
    next()
}

const router: Router = Router()

// All bookmark routes require authentication
router.use(authenticateToken)

router.post("/", validateBookmark, createBookmark)
router.get("/", getUserBookmarks)
router.get("/:bookmark_id", getBookmark)
router.delete("/:bookmark_id", deleteBookmark)

export default router
