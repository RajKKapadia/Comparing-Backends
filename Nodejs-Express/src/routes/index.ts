import { Router } from "express"

import authRoutes from "./auth"
import bookmarkRoutes from "./bookmarks"
import { redirectToUrl } from "../controllers/redirectController"

const router: Router = Router()

router.use("/auth", authRoutes)
router.use("/bookmarks", bookmarkRoutes)

// Short URL redirect (must be last to avoid conflicts)
router.get("/:short_code", redirectToUrl)

export default router
