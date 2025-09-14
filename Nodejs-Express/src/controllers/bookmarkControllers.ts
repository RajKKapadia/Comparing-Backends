import { Response, Request } from "express"
import { z } from "zod"
import { eq, and } from "drizzle-orm"

import { bookmarkSchema } from "@/schemas/bookmark"
import { generateShortCode, isValidUrl } from "@/utils/shortCodes"
import { db } from "@/drizzle/db"
import { bookmarks } from "@/drizzle/schema"
import { omit } from "@/utils"


export const createBookmark = async (request: Request, response: Response) => {
    try {
        const body = bookmarkSchema.safeParse(request.body)

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

        if (!isValidUrl(body.data.url)) {
            return response.status(400).json({ error: "Invalid URL format." })
        }

        const existingBookmark = await db.query.bookmarks.findFirst({
            where(fields, operators) {
                return operators.and(operators.eq(fields.originalUrl, body.data.url), operators.eq(fields.isActive, true))
            },
        })

        if (existingBookmark) {
            response.status(403).json({ error: "URL already exists." })
            return
        }

        // Generate unique short code
        let shortCode: string
        let attempts = 0
        const maxAttempts = 10

        do {
            shortCode = generateShortCode()
            const existing = await db.select().from(bookmarks).where(eq(bookmarks.shortCode, shortCode)).limit(1)
            if (existing.length === 0) break
            attempts++
        } while (attempts < maxAttempts)

        if (attempts >= maxAttempts) {
            return response.status(500).json({ error: "Failed to generate unique short code" })
        }

        // Create bookmark
        const [newBookmark] = await db.insert(bookmarks).values({
            userId: request.userId as string,
            title: body.data.title,
            originalUrl: body.data.url,
            shortCode,

        }).returning()
        response.status(201).json(omit(newBookmark, ["userId"]))
    } catch (error) {
        console.error("Create bookmark error:", error)
        response.status(500).json({ error: "Internal server error" })
    }
}

export const getAllBookmarks = async (request: Request, response: Response) => {
    try {
        const userId = request.userId as string

        const userBookmarks = await db.select().from(bookmarks)
            .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isActive, true)))
            .orderBy(bookmarks.createdAt)

        const formattedBookmarks = userBookmarks.map(bookmark => (omit(bookmark, ["userId"])))

        response.json(formattedBookmarks)
    } catch (error) {
        console.error("Get bookmarks error:", error)
        response.status(500).json({ error: "Internal server error" })
    }
}

export const getBookmark = async (request: Request, response: Response) => {
    try {
        const bookmarkId = request.params.bookmark_id
        const userId = request.userId as string

        console.log(bookmarkId)

        const [bookmark] = await db.select().from(bookmarks)
            .where(and(
                eq(bookmarks.id, bookmarkId),
                eq(bookmarks.userId, userId),
                eq(bookmarks.isActive, true)
            ))
            .limit(1)

        if (!bookmark) {
            return response.status(404).json({ error: "Bookmark not found." })
        }

        response.json(omit(bookmark, ["userId"]))
    } catch (error) {
        console.error("Get bookmark error:", error)
        response.status(500).json({ error: "Internal server error." })
    }
}

export const deleteBookmark = async (request: Request, response: Response) => {
    try {
        const bookmarkId = request.params.bookmark_id
        const userId = request.userId as string

        // Soft delete by setting isActive to false
        const [updatedBookmark] = await db.update(bookmarks)
            .set({ isActive: false, updatedAt: new Date() })
            .where(and(
                eq(bookmarks.id, bookmarkId),
                eq(bookmarks.userId, userId),
                eq(bookmarks.isActive, true)
            ))
            .returning()

        if (!updatedBookmark) {
            return response.status(404).json({ error: "Bookmark not found." })
        }
        response.sendStatus(204)
    } catch (error) {
        console.error("Delete bookmark error:", error)
        response.status(500).json({ error: "Internal server error." })
    }
}