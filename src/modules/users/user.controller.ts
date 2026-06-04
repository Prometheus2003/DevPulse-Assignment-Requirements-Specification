import type { Request, Response } from "express"
import { userService } from "./user.service"


const createUser = async (req: Request, res: Response) => {
    //const { name, email, password, age } = req.body
    try {
        const result = await userService.createUserIntoDB(req.body)
        res.status(200).json({
            message: "User created successfully",
            data: result.rows[0],
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            error: error,
        })
    }
}
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUsersFromDB();
        res.status(200).json({
            message: "Users retrieved successfully",
            data: result.rows,
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
        const result = await userService.getUserByIdFromDB(id as string);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        res.status(200).json({
            message: "User retrieved successfully",
            data: result.rows[0],
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
            data: result.rows[0],
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
}