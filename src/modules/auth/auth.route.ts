import { Router } from "express"
import { authController } from "./auth.controller"
const router = Router()
router.post("/login", authController.loginUser)
router.post("/refresh-token", authController.refreshToken)
router.post("/signup", authController.signupUser)
export const authRoute = router