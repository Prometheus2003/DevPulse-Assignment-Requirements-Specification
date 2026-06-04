import { Router } from "express"
import { issueController } from "./issue.controller"

const router = Router()
router.post("/", issueController.createIssue)
router.get("/", issueController.getAllIssues)
router.get("/:id", issueController.getIssueById)
router.put("/:id", issueController.updateIssueStatus)
router.delete("/:id", issueController.deleteIssue)
export const issueRoute = router