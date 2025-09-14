import { z } from "zod"

export const userSchema = z.object({
    email: z.email("Email is required."),
    password: z.string().min(6, "Password is required and have minimum 6 characters.")
})

export type SessionValues = {
    userId: string
    lastSeens: string
    role: "user" | "admin"
}