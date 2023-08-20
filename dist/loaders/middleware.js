"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const middleware_1 = require("../middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.default = (app) => {
    app.use((0, cookie_parser_1.default)());
    app.use(middleware_1.loadUserInfo);
};
//# sourceMappingURL=middleware.js.map