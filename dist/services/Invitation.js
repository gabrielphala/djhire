"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Invitation_1 = __importDefault(require("../models/Invitation"));
const String_1 = require("../helpers/String");
class InvitationServices {
    static async add(wrapRes, body, { userInfo }) {
        try {
            const { dj_id, event_id } = body;
            if ((await Invitation_1.default.exists({ dj_id, event_id })).found)
                throw 'Invitation already sent';
            Invitation_1.default.insert({
                invitation_no: (0, String_1.makeId)(5),
                dj_id,
                event_id,
                organizer_id: userInfo.id
            });
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async getOpenDJInvitations(wrapRes, body, req) {
        try {
            const { dj_id } = req.params;
            wrapRes.invitations = await Invitation_1.default.getOpenDJInvitations(dj_id);
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async getEventInvitees(wrapRes, body, req) {
        try {
            const { event_id } = req.params;
            wrapRes.invitees = await Invitation_1.default.getEventInvitees(event_id);
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async removeById(wrapRes, body) {
        try {
            const { invitation_id } = body;
            Invitation_1.default.update({ id: invitation_id }, {
                isDeleted: true
            });
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
}
exports.default = InvitationServices;
;
//# sourceMappingURL=Invitation.js.map