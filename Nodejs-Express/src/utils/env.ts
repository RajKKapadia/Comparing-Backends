import { z } from "zod"
import dotenv from "dotenv"
import { expand } from "dotenv-expand"

if (process.env.NODE_ENV !== "production") {
    const result = dotenv.config()
    expand(result)
}

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z
        .string()
        .default("5000")
        .transform((v) => {
            const n = Number(v)
            if (!Number.isInteger(n) || n <= 0) throw new Error("PORT must be a positive integer")
            return n
        }),
    DATABASE_URL: z.url().startsWith("postgresql://"),
    REDIS_URL: z.url().startsWith("redis://")
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("\n❌ Invalid environment variables:")
    for (const issue of parsed.error.issues) {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`)
    }
    process.exit(1)
}

export const env = parsed.data
