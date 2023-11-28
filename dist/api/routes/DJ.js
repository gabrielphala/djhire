"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const DJ_1 = __importDefault(require("../../services/DJ"));
const middleware_1 = require("../../middleware");
const multer_1 = require("../../config/multer");
exports.default = (app) => {
    app.get('/sign-up', base_1.default.render('Sign up'));
    app.get('/sign-in', base_1.default.render('Sign in'));
    app.get('/sign-out', base_1.default.signOut);
    app.get('/my-schedule', middleware_1.isUserDJ, base_1.default.render('DJ schedule'));
    app.get('/profile', middleware_1.isUserDJ, base_1.default.render('Profile'));
    app.post('/sign-up', base_1.default.wrap(DJ_1.default.signUp));
    app.post('/sign-in', base_1.default.wrap(DJ_1.default.signIn));
    app.post('/dj/updates/general-details', base_1.default.wrap_with_store(DJ_1.default.updateGeneralDetails));
    app.post('/dj/updates/rates', base_1.default.wrap_with_store(DJ_1.default.updateRates));
    app.post('/dj/search/by/name', base_1.default.wrap(DJ_1.default.searchByName));
    app.post('/dj/updates/profile', (req, res, next) => {
        (0, multer_1.anyFiles)('./public/assets/uploads/profile')(req, res, async (err) => {
            await DJ_1.default.updateProfile(req.body, req, res);
            next();
        });
    }, base_1.default.wrap_with_request((res_wrap, _, req) => {
        res_wrap.successful = req['successful'];
        res_wrap.error = req['error'];
        return res_wrap;
    }));
};
//# sourceMappingURL=dj.js.map