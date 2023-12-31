import { Application } from "express";

import baseController from "../controllers/base";
import djService from "../../services/DJ"

import { isUserDJ } from "../../middleware";
import { anyFiles } from "../../config/multer";

export default (app: Application) => {
    app.get('/sign-up', baseController.render('Sign up'))
    app.get('/sign-in', baseController.render('Sign in'))
    app.get('/sign-out', baseController.signOut)

    app.get('/my-schedule', isUserDJ, baseController.render('DJ schedule'))
    app.get('/profile', isUserDJ, baseController.render('Profile'))

    app.post('/sign-up', baseController.wrap(djService.signUp))
    app.post('/sign-in', baseController.wrap(djService.signIn))

    app.post('/dj/updates/general-details', baseController.wrap_with_store(djService.updateGeneralDetails))
    app.post('/dj/updates/rates', baseController.wrap_with_store(djService.updateRates))
    app.post('/dj/search/by/name', baseController.wrap(djService.searchByName))

    app.post(
        '/dj/updates/profile',
        (req, res, next) => {
            anyFiles('./public/assets/uploads/profile')(req, res, async (err) => {
                await djService.updateProfile(
                    req.body,
                    req,
                    res
                )

                next()
            })
        },
        baseController.wrap_with_request((res_wrap, _, req) => {
            res_wrap.successful = req['successful'];
            res_wrap.error = req['error'];

            return res_wrap
        })
    );
}