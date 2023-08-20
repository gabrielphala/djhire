"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Event_1 = __importDefault(require("../../services/Event"));
exports.default = (app) => {
    app.post('/event/add', base_1.default.wrap_with_store(Event_1.default.add));
    app.post('/event/edit', base_1.default.wrap(Event_1.default.edit));
    app.post('/event/remove/by/id', base_1.default.wrap(Event_1.default.removeEvent));
    app.post('/events/get/by/organizer', base_1.default.wrap_with_store(Event_1.default.getEventsByOrganizer));
};
//# sourceMappingURL=event.js.map