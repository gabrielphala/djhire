import { Application } from "express";

import baseController from "../controllers/base";
import organizerServices from "../../services/Organizer";

export default (app: Application) => {
    app.get('/organizer/sign-up', baseController.render('Sign up'))
    app.get('/organizer/sign-in', baseController.render('Sign in'))
    app.get('/organizer/sign-out', baseController.signOutOrganizer)
    app.get('/organizer/event-manager', baseController.render('Event manager'))

    app.post('/organizer/sign-up', baseController.wrap(organizerServices.signUp))
    app.post('/organizer/sign-in', baseController.wrap(organizerServices.signIn))
}