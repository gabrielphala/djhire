"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../controllers/base"));
const Payment_1 = __importDefault(require("../../services/Payment"));
exports.default = (app) => {
    app.post('/payments/get/by/organizer', base_1.default.wrap_with_store(Payment_1.default.getByOrganizer));
    app.post('/payment/pay', base_1.default.wrap(Payment_1.default.pay));
};
//# sourceMappingURL=payment.js.map