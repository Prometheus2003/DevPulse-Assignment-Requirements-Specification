import { pool } from "../../db"
import type { IIssue, IUpdateIssue } from "./issue.interface";


const createIssueIntoDB = async (payload: IIssue) => {
    const { title, description, type, reporter_id } = payload;
    const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *
    `, [title, description, type, reporter_id])

    return result.rows[0];
}
const getAllIssuesFromDB = async (filters: any) => {
    const { type, status, sort = "newest" } = filters;
    let query = `SELECT * FROM issues`;
    const conditions = [];
    const values = [];
    if (type) {
        conditions.push(`type = $${values.length}`);
        values.push(type);
    }
    if (status) {
        conditions.push(`status = $${values.length}`);
        values.push(status);
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    if (sort === "oldest") {
        query += ` ORDER BY created_at ASC`;
    } else {
        query += ` ORDER BY created_at DESC`;
    }
    const result = await pool.query(query, values);
    return result.rows;
}
const getIssueByIdFromDB = async (id: string) => {
    const result = await pool.query(`
            SELECT * FROM issues WHERE id = $1
        `, [id])
    return result.rows[0];
}
const updateIssueStatusInDB = async (id: string, payload: IUpdateIssue) => {
    const { title, description, type } = payload;
    const result = await pool.query(`
        UPDATE issues SET title= $1, description = $2, type = $3, updated_at = NOW() WHERE id = $4 RETURNING *
    `, [title, description, type, id])
    return result.rows[0];
}
const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM issues WHERE id = $1 RETURNING *
    `, [id])
    return result.rows[0];
}
export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getIssueByIdFromDB,
    updateIssueStatusInDB,
    deleteIssueFromDB,
}