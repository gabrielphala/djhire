"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("./express"));
const middleware_1 = __importDefault(require("./middleware"));
exports.default = (app) => {
    (0, middleware_1.default)(app);
    (0, express_1.default)(app);
};
//# sourceMappingURL=index.js.map