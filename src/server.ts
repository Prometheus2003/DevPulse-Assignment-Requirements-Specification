
import express, { type Application, type Request, type Response } from 'express'
import { Pool } from 'pg'
const app: Application = express()
const port = 8000

app.use(express.json())
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_eF1DlbWzwKM8@ep-delicate-mud-aon1xhs0-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
})
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )`
        )
        console.log('Database connected successfully')
    } catch (err) {
        console.error('Error connecting to the database', err)
    }
}
initDB()
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
})
app.post('/', async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body
    res.status(201).json({
        message: "Created",
        data: { name, email, age },
    })
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})