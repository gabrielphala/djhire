"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const Validation_1 = __importDefault(require("../helpers/Validation"));
class EventServices {
    static async add(wrapRes, body, { userInfo }) {
        try {
            const { name, location, start, end } = body;
            Validation_1.default.validate({
                'name': { value: name, min: 3, max: 50 },
                'location': { value: location, min: 5, max: 255 }
            });
            await Event_1.default.insert({
                name,
                location,
                organizer_id: userInfo.id,
                start: new Date(`${start + ':00.000+02:00'}`),
                end: new Date(`${end + ':00.000+02:00'}`)
            });
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async getEventsByOrganizer(wrapRes, body, { userInfo }) {
        try {
            wrapRes.events = await Event_1.default.find({
                condition: { organizer_id: userInfo.id }
            });
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
}
exports.default = EventServices;
;
//# sourceMappingURL=Event.js.map