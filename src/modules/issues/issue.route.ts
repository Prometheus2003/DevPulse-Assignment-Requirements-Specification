import { Router } from "express"
import { issueController } from "./issue.controller"
import auth from "../../middleware/auth.middleware";
import role from "../../middleware/role.middleware";

const router = Router()
router.post("/", auth(), role(["contributor", "maintainer"]), issueController.createIssue)
router.get("/", auth(), role(["contributor", "maintainer"]), issueController.getAllIssues)
router.get("/:id", auth(), role(["contributor", "maintainer"]), issueController.getIssueById)
router.put("/:id", auth(), role(["contributor", "maintainer"]), issueController.updateIssueStatus)
router.delete("/:id", auth(), role(["maintainer"]), issueController.deleteIssue)
export const issueRoute = router