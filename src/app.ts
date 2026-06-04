
import express, { type Application, type Request, type Response } from 'express'
import config from './config';
import { userRoute } from './modules/users/user.route';
import { issueRoute } from './modules/issues/issue.route';
import { authRoute } from './modules/auth/auth.route';
const app: Application = express()

app.use(express.json())
app.use("/api/users", userRoute)
app.use("/api/issues", issueRoute)
app.use("/api/auth", authRoute)
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