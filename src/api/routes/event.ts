import { Application } from "express";

import baseController from "../controllers/base";
import eventServices from "../../services/Event";

export default (app: Application) => {
    app.post('/event/add', baseController.wrap_with_store(eventServices.add))
    app.post('/event/edit', baseController.wrap(eventServices.edit))
    app.post('/event/remove/by/id', baseController.wrap(eventServices.removeEvent))
    app.post('/event/get/by/id/:event_id', baseController.wrap_with_request(eventServices.getById))
    app.post('/events/get/by/organizer', baseController.wrap_with_store(eventServices.getEventsByOrganizer))
}