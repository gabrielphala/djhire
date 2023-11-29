"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Organizer_1 = __importDefault(require("../../services/Organizer"));
exports.default = (app) => {
    app.get('/organizer/sign-up', base_1.default.render('Sign up'));
    app.get('/organizer/sign-in', base_1.default.render('Sign in'));
    app.get('/organizer/sign-out', base_1.default.signOutOrganizer);
    app.get('/organizer/event-manager', base_1.default.render('Event manager'));
    app.get('/organizer/payments', base_1.default.render('Payments'));
    app.get('/organizer/pay', base_1.default.render('Process pay'));
    app.get('/organizer/event-view', base_1.default.render('Event view'));
    app.get('/organizer/sign-out', base_1.default.signOut);
    app.post('/organizer/sign-up', base_1.default.wrap(Organizer_1.default.signUp));
    app.post('/organizer/sign-in', base_1.default.wrap(Organizer_1.default.signIn));
};
//# sourceMappingURL=organizer.js.map