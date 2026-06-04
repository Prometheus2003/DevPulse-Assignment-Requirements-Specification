import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password } = payload;
    const result = await pool.query(`
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *
    `, [name, email, password])

    return result;
}
const getAllUsersFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM users
        `)
    return result;
}
const getUserByIdFromDB = async (id: string) => {
    const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [id])
    return result;
}
const updateUserInDB = async (id: string, payload: IUser) => {
    const { name, password } = payload;

    const result = await pool.query(
        `
    UPDATE users 
    SET 
    name=COALESCE($1,name),
    password=COALESCE($2,password),
    age=COALESCE($3,age),
    is_active=COALESCE($4,is_active) 

    WHERE id=$5 RETURNING *
    `,
        [name, password, id],
    );

    return result;
};

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    updateUserInDB,
}
