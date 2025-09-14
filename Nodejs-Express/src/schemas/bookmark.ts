import { z } from "zod"

export const bookmarkSchema = z.object({
    title: z.string().min(1, "Title is required."),
    url: z.string().min(1, "URL is required.")
})