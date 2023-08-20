import { Application } from "express"

import userRoutes from "./user"
import organizerRoutes from "./organizer"
import djRoutes from "./dj"
import eventRoutes from "./event"

export default (app: Application) : void => {
    userRoutes(app)
    organizerRoutes(app)
    djRoutes(app)
    eventRoutes(app)
}