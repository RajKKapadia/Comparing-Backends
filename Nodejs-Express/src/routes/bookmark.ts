import { NextFunction, Router, Request, Response } from "express"
import z from "zod"

import { bookmarkSchema } from "@/schemas/bookmark"
import { authenticateToken } from "@/middleware"
import { createBookmark, getAllBookmarks, getBookmark, deleteBookmark } from "@/controllers/bookmarkControllers"

const router = Router()

const validateBookmark = (request: Request, response: Response, next: NextFunction): void => {
    const result = bookmarkSchema.safeParse(request.body)
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

router.use(authenticateToken)

router.post("/create", validateBookmark, createBookmark)
router.get("/get", getAllBookmarks)
router.get("/get/:bookmark_id", getBookmark)
router.delete("/delete/:bookmark_id", deleteBookmark)

export default router