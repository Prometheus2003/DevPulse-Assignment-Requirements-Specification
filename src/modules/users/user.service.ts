import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password } = payload;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *
    `, [name, email, hashPassword])
    delete result.rows[0].password;
    return result.rows[0];
}
const getAllUsersFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM users
        `)
    delete result.rows[0].password;
    return result.rows;
}
const getUsersByIdsFromDB = async (ids: number[]) => {
    if (!ids.length) return [];
    const result = await pool.query(`
            SELECT id,name,role FROM users WHERE id = ANY($1)
        `, [ids])
    delete result.rows[0].password;
    return result.rows;
}
const updateUserInDB = async (id: string, payload: IUser) => {
    const { name, password } = payload;

    const result = await pool.query(
        `
    UPDATE users 
    SET 
    name = COALESCE($1, name),
    password = COALESCE($2, password),
    updated_at = NOW() 
    WHERE id = $3 RETURNING *
    `,
        [name, password, id]
    );
    delete result.rows[0].password;
    return result.rows[0];
};
const deleteUserFromDB = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM users WHERE id = $1 RETURNING *
    `, [id])
    return result.rows[0];
}


export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getUsersByIdsFromDB,
    updateUserInDB,
    deleteUserFromDB,
}
