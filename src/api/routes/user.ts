import { Application } from "express";

import baseController from "../controllers/base";
import userServices from "../../services/User";

export default (app: Application) => {
    app.post('/user/get/by/session', baseController.wrap_with_store(userServices.getUserBySession))
}