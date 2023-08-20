import { Application } from "express"
import { loadUserInfo } from "../middleware";

import cookieParser from "cookie-parser"

export default (app: Application) => {
    app.use(cookieParser());

    app.use(loadUserInfo)
}