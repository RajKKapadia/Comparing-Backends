import express from "express"
import "dotenv/config"

import routes from "@/routes"
import { env } from "@/utils/env"

const app = express()

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/health", (request, response) => {
    response.json({
        status: "OK",
        timestamp: new Date().toISOString()
    })
})

app.use("/", routes)

app.listen(env.PORT, () => {
    console.log(`Server is running at: ${env.PORT}`)
})
