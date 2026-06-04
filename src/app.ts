
import express, { type Application, type Request, type Response } from 'express'
import { initDB, pool } from './db';
import config from './config';
import { userRoute } from './modules/users/user.route';
import { issueRoute } from './modules/issues/issue.route';
const app: Application = express()

app.use(express.json())
app.use("/api/users", userRoute)
app.use("/api/issues", issueRoute)
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
})




app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
})
export default app