"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const DJ_1 = __importDefault(require("../../services/DJ"));
exports.default = (app) => {
    app.get('/sign-up', base_1.default.render('Sign up'));
    app.get('/sign-in', base_1.default.render('Sign in'));
    app.get('/sign-out', base_1.default.signOut);
    app.get('/my-schedule', base_1.default.render('DJ schedule'));
    app.post('/sign-up', base_1.default.wrap(DJ_1.default.signUp));
    app.post('/sign-in', base_1.default.wrap(DJ_1.default.signIn));
};
//# sourceMappingURL=dj.js.map