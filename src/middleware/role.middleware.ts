import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

type Role = "maintainer" | "contributor";

const role = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const user = (req as any).user as JwtPayload | undefined;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!allowedRoles.includes(user.role as Role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You don't have permission"
            });
        }

        next();
    };
};

export default role;