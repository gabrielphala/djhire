"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const loaders_1 = __importDefault(require("./loaders"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
(() => {
    (0, loaders_1.default)(app);
    app.use(express_1.default.static('public'));
    app.listen((0, env_1.getPort)(), () => {
        console.log(`Running on port: ${(0, env_1.getPort)()}`);
    });
})();
//# sourceMappingURL=app.js.map