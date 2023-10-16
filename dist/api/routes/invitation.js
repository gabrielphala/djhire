"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Invitation_1 = __importDefault(require("../../services/Invitation"));
exports.default = (app) => {
    app.post('/invitation/add', base_1.default.wrap_with_store(Invitation_1.default.add));
    app.post('/invitation/remove', base_1.default.wrap(Invitation_1.default.removeById));
    app.post('/invitation/accept', base_1.default.wrap_with_store(Invitation_1.default.accept));
    app.post('/invitation/deny', base_1.default.wrap_with_store(Invitation_1.default.deny));
    app.post('/invitations/get/by/dj/:dj_id', base_1.default.wrap_with_request(Invitation_1.default.getOpenDJInvitations));
    app.post('/invitations/get/invitees/:event_id', base_1.default.wrap_with_request(Invitation_1.default.getEventInvitees));
};
//# sourceMappingURL=invitation.js.map