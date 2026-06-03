import app from "./app"
import config from "./config/index"
import { initDB } from "./db";
const main = () => {
    initDB();
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`)
    })
}
main()