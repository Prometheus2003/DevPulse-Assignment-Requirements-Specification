import { pool } from "../../db";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
const loginUserIntoDB = async (payload: {
    email: string,
    password: string,
}) => {
    const { email, password } = payload;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email])

    if (userData.rows.length === 0) {
        throw new Error("Invalid credentials!");
    }
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) {
        throw new Error("Invalid credentials!");
    }
    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
    const accessToken = jwt.sign(jwtpayload, config.secret as string, { expiresIn: "1d" })

    const refreshToken = jwt.sign(jwtpayload, config.refresh_secret as string, { expiresIn: "1d" })
    return {
        token: accessToken, refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}
const generateFreshToken = async (token: string) => {
    if (!token) {
        throw new Error("Unauthorized");
    }

    const decoded = jwt.verify(
        token as string,
        config.refresh_secret as string,
    ) as JwtPayload;

    const userData = await pool.query(
        `
     SELECT * FROM users WHERE email=$1   
        `,
        [decoded.email],
    );

    const user = userData.rows[0];

    if (userData.rows.length === 0) {
        throw new Error("User not found!!");
    }

    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(jwtpayload, config.secret as string, {
        expiresIn: "1d",
    });
    return {
        token: accessToken,
    }
}
const signupUserIntoDB = async (payload: any) => {
    const { name, email, password } = payload;
    const role = "contributor";
    const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email])
    if (existingUser.rows.length > 0) {
        throw new Error("User already exists with this email!")
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *
    `, [name, email, hashPassword, role])
    delete result.rows[0].password;
    return result.rows[0];
}
export const authService = {
    loginUserIntoDB,
    signupUserIntoDB,
    generateFreshToken
}