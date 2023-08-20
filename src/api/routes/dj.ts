import { Application } from "express";

import baseController from "../controllers/base";
import djService from "../../services/DJ"

export default (app: Application) => {
    app.get('/sign-up', baseController.render('Sign up'))
    app.get('/sign-in', baseController.render('Sign in'))
    app.get('/sign-out', baseController.signOut)

    app.get('/my-schedule', baseController.render('DJ schedule'))

    app.post('/sign-up', baseController.wrap(djService.signUp))
    app.post('/sign-in', baseController.wrap(djService.signIn))
}