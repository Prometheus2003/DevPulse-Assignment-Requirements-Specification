import { Router } from 'express'
import { userController } from './user.controller'
import auth from "../../middleware/auth.middleware"
import role from "../../middleware/role.middleware";
const router = Router()

router.post("/", userController.createUser)
router.get("/", auth(),
    role(["maintainer"]), userController.getAllUsers)
router.get("/:id", auth(), role(["contributor", "maintainer"]), userController.getUserById)
router.put("/:id", auth(), role(["contributor", "maintainer"]), userController.updateUser)
router.delete("/:id", auth(),
    role(["maintainer"]), userController.deleteUser)
export const userRoute = router