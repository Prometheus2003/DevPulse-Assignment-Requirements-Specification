
import express, { type Application, type Request, type Response } from 'express'
import config from './config';
import { userRoute } from './modules/users/user.route';
import { issueRoute } from './modules/issues/issue.route';
import { authRoute } from './modules/auth/auth.route';
import CookieParser from "cookie-parser"
import cors from "cors"
import globalErrorHandler from './middleware/globalErrorHandler';
const app: Application = express()

app.use(CookieParser())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: 'http://localhost:8000',
    })
)
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Express Server",
        "author": "Next Level"
    })
})

app.use("/api/users", userRoute)
app.use("/api/issues", issueRoute)
app.use("/api/auth", authRoute)
app.use(globalErrorHandler)


app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
})
export default app