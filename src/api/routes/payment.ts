import { Application } from "express";

import baseController from "../controllers/base";
import paymentServices from "../../services/Payment";

export default (app: Application) => {
    app.post('/payments/get/by/organizer', baseController.wrap_with_store(paymentServices.getByOrganizer))
    app.post('/payment/pay', baseController.wrap(paymentServices.pay))
}