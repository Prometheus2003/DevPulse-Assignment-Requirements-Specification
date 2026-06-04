import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";
const auth = () => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized access!!"
                })
            }
            const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload;

            const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email],
            )
            if (userData.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "User not found"
                })
            }
            (req as any).user = decoded;

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    }
}
export default auth