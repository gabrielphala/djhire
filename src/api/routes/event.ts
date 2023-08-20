import { Application } from "express";

import baseController from "../controllers/base";
import eventServices from "../../services/Event";

export default (app: Application) => {
    app.post('/event/add', baseController.wrap_with_store(eventServices.add))
    app.post('/events/get/by/organizer', baseController.wrap_with_store(eventServices.getEventsByOrganizer))
}