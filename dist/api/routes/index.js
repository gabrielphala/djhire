"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
const organizer_1 = __importDefault(require("./organizer"));
const dj_1 = __importDefault(require("./dj"));
const event_1 = __importDefault(require("./event"));
const invitation_1 = __importDefault(require("./invitation"));
const payment_1 = __importDefault(require("./payment"));
exports.default = (app) => {
    (0, user_1.default)(app);
    (0, organizer_1.default)(app);
    (0, dj_1.default)(app);
    (0, event_1.default)(app);
    (0, invitation_1.default)(app);
    (0, payment_1.default)(app);
};
//# sourceMappingURL=index.js.map