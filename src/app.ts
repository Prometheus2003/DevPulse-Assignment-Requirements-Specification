
import express, { type Application, type Request, type Response } from 'express'
import { initDB, pool } from './db';
import config from './config';
const app: Application = express()

app.use(express.json())


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
})
app.post("/api/users", async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body
    try {
        const result = await pool.query(`
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *
    `, [name, email, password])
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
})
app.get("/api/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users
        `)
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
})
app.get("/api/users/:id", async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [id])
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
})

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
})
export default app