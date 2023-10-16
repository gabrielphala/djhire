import { NextFunction, Request, Response } from "express";

import Jwt from "./helpers/Jwt";

export const isUserDJ = (req: Request, res: Response, next: NextFunction) => {
    if (!req['store'] || req['store'] && !req['store'].userInfo || req['store'] && req['store'].userInfo && !req['store'].userInfo.stage_name)
        return res.redirect('/sign-in')

    next()
}

export const isUserOrganizer = (req: Request, res: Response, next: NextFunction) => {
    if (!req['store'] || req['store'] && !req['store'].userInfo || req['store'] && req['store'].userInfo && !req['store'].userInfo.fullname)

    next()
}

export const loadUserInfo = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies || req.cookies && !req.cookies['dj_user'])
        return next();

    Jwt.verify(req.cookies['dj_user'].jwtAccess, (userInfo: object) => {
        if (!req['store']) req['store'] = {}
        req['store'].userInfo = userInfo;
        res.locals.userInfo = userInfo;
    });

    next();
}