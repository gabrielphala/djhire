"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadUserInfo = exports.isUserOrganizer = exports.isUserDJ = void 0;
const Jwt_1 = __importDefault(require("./helpers/Jwt"));
const isUserDJ = (req, res, next) => {
    if (!req['store'] || req['store'] && !req['store'].userInfo || req['store'] && req['store'].userInfo && !req['store'].userInfo.stage_name)
        return res.redirect('/sign-in');
    next();
};
exports.isUserDJ = isUserDJ;
const isUserOrganizer = (req, res, next) => {
    if (!req['store'] || req['store'] && !req['store'].userInfo || req['store'] && req['store'].userInfo && !req['store'].userInfo.fullname)
        next();
};
exports.isUserOrganizer = isUserOrganizer;
const loadUserInfo = (req, res, next) => {
    if (!req.cookies || req.cookies && !req.cookies['dj_user'])
        return next();
    Jwt_1.default.verify(req.cookies['dj_user'].jwtAccess, (userInfo) => {
        if (!req['store'])
            req['store'] = {};
        req['store'].userInfo = userInfo;
        res.locals.userInfo = userInfo;
    });
    next();
};
exports.loadUserInfo = loadUserInfo;
//# sourceMappingURL=middleware.js.map