import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { userService } from "../users/user.service";

export const createIssue = async (req: Request, res: Response) => {
    try {
        const issue = await issueService.createIssueIntoDB({ ...req.body });
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: issue,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}
export const getAllIssues = async (req: Request, res: Response) => {
    try {
        const issues = await issueService.getAllIssuesFromDB(req.query);
        const reporterIds = [...new Set(issues.map((i: any) => i.reporter_id))];
        const users = await userService.getUsersByIdsFromDB(reporterIds);
        const userMap: any = {};
        users.forEach((u: any) => {
            userMap[u.id] = u;
        });
        const formatted = issues.map((issue: any) => {
            const { reporter_id, created_at, updated_at, ...rest } = issue;
            return {
                id: rest.id,
                title: rest.title,
                description: rest.description,
                type: rest.type,
                status: rest.status,
                reporter: userMap[reporter_id] || null,
                created_at,
                updated_at,
            };
        });
        return res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: formatted,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getIssueById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const issue = await issueService.getIssueByIdFromDB(id as string);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const users = await userService.getUsersByIdsFromDB([issue.reporter_id]);
        const reporter = users[0] || null;
        const { reporter_id, created_at, updated_at, ...rest } = issue;
        const formatted = {
            id: rest.id,
            title: rest.title,
            description: rest.description,
            type: rest.type,
            status: rest.status,
            reporter,
            created_at,
            updated_at,
        };
        return res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: formatted,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}
export const updateIssueStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await issueService.updateIssueStatusInDB(id as string, req.body);
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}
export const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await issueService.deleteIssueFromDB(id as string);
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}

export const issueController = {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssueStatus,
    deleteIssue,
}