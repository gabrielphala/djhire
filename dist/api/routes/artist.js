"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Artist_1 = __importDefault(require("../../services/Artist"));
exports.default = (app) => {
    app.get('/sign-up', base_1.default.render('Sign up'));
    app.get('/sign-in', base_1.default.render('Sign in'));
    app.get('/my-schedule', base_1.default.render('Artist schedule'));
    app.post('/sign-up', base_1.default.wrap(Artist_1.default.signUp));
};
//# sourceMappingURL=artist.js.map