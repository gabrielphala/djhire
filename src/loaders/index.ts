import { Application } from "express";

import expressLoader from "./express"
import middlewareLoader from "./middleware";

export default (app: Application) => {
    middlewareLoader(app);
    expressLoader(app)
}