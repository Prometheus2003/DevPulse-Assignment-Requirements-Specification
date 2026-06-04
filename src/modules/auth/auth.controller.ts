import { type Request, type Response } from "express"
import { authService } from "./auth.service";
const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);
        const { refreshToken } = result
        res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax'
        })

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
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
const refreshToken = async (req: Request, res: Response) => {
    try {
        const result = await authService.generateFreshToken(req.cookies.refreshToken,);
        res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax'
        })

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
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

const signupUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.signupUserIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
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
export const authController = {
    loginUser,
    signupUser,
    refreshToken
}