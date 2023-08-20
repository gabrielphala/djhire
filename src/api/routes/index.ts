import { Application } from "express"

// import baseRoutes from "./base"
import organizerRoutes from "./organizer"
import djRoutes from "./dj"
import eventRoutes from "./event"

export default (app: Application) : void => {
    // baseRoutes(app)
    organizerRoutes(app)
    djRoutes(app)
    eventRoutes(app)
}