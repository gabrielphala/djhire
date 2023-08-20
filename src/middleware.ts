import { NextFunction, Request, Response } from "express";

import Jwt from "./helpers/Jwt";

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