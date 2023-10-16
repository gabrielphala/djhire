"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const DJ_1 = __importDefault(require("../../services/DJ"));
const middleware_1 = require("../../middleware");
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
};
//# sourceMappingURL=dj.js.map