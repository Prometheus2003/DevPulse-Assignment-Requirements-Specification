import type { Request, Response } from "express";
import { issueService } from "./issue.service";

export const createIssue = async (req: Request, res: Response) => {
    try {
        const issue = await issueService.createIssueIntoDB({ ...req.body});
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
        const result = await issueService.getAllIssuesFromDB();
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: result.rows,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}
export const getIssueById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await issueService.getIssueByIdFromDB(id as string);
        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
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