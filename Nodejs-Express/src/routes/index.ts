import { Router } from "express"

import authRoutes from "@/routes/auth"
import bookmarkRoutes from "@/routes/bookmark"
import { redirectToUrl } from "@/controllers/redirectControllers"

const router: Router = Router()

router.use("/auth", authRoutes)
router.use("/bookmarks", bookmarkRoutes)

router.get("/:short_code", redirectToUrl)

export default router