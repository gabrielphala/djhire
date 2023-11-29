import { Application } from "express";

import baseController from "../controllers/base";
import organizerServices from "../../services/Organizer";

import { isUserOrganizer } from "../../middleware";

export default (app: Application) => {
    app.get('/organizer/sign-up', baseController.render('Sign up'))
    app.get('/organizer/sign-in', baseController.render('Sign in'))
    app.get('/organizer/sign-out', baseController.signOutOrganizer)
    app.get('/organizer/event-manager', baseController.render('Event manager'))
    app.get('/organizer/payments', baseController.render('Payments'))
    app.get('/organizer/pay', baseController.render('Process pay'))
    app.get('/organizer/event-view', baseController.render('Event view'))
    app.get('/organizer/sign-out', baseController.signOut)

    app.post('/organizer/sign-up', baseController.wrap(organizerServices.signUp))
    app.post('/organizer/sign-in', baseController.wrap(organizerServices.signIn))
}