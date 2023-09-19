import { Application } from "express";

import baseController from "../controllers/base";
import invitationServices from "../../services/Invitation";

export default (app: Application) => {
    app.post('/invitation/add', baseController.wrap_with_store(invitationServices.add))
    app.post('/invitation/remove', baseController.wrap(invitationServices.removeById))
    app.post('/invitations/get/by/dj/:dj_id', baseController.wrap_with_request(invitationServices.getOpenDJInvitations))
    app.post('/invitations/get/invitees/:event_id', baseController.wrap_with_request(invitationServices.getEventInvitees))
}