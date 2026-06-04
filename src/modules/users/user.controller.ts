import type { Request, Response } from "express"
import { userService } from "./user.service"
import sendResponse from "../../utils/sendResponse"


const createUser = async (req: Request, res: Response) => {
    //const { name, email, password, age } = req.body
    try {
        const result = await userService.createUserIntoDB(req.body)
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User Created Successfully",
            data: result
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            data: error
        })
    }
}
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUsersFromDB();
        res.status(200).json({
            message: "Users retrieved successfully",
            data: result,
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            error: error,
        })
    }
}
const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await userService.getUsersByIdsFromDB([Number(id)]);
        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        res.status(200).json({
            message: "User retrieved successfully",
            data: result[0],
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            error: error,
        })
    }
}
const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await userService.updateUserInDB(id as string, req.body);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User Not found!",
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully!",
            data: result[0],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.deleteUserFromDB(id as string);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
export const userController = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}
