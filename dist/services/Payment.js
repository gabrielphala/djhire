"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = __importDefault(require("../models/Payment"));
const DJ_1 = __importDefault(require("../models/DJ"));
class OrganizerServices {
    static async getByOrganizer(wrapRes, body, { userInfo }) {
        try {
            const payments = await Payment_1.default.getByOrganizer(userInfo.id);
            wrapRes.payments = payments;
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async pay(wrapRes, body) {
        try {
            const { id, amount } = body;
            const payment = await Payment_1.default.findOne({
                condition: { id }
            });
            if (!payment)
                return;
            const dj = await DJ_1.default.findOne({
                condition: { id: payment.dj_id }
            });
            if (dj.min_deposit == amount && payment.total == 0) {
                payment.total = amount;
                payment.status = 'deposit made';
            }
            else if (amount + payment.total == dj.full_amount) {
                payment.total += amount;
                payment.status = 'fully paid';
            }
            payment.save();
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
}
exports.default = OrganizerServices;
;
//# sourceMappingURL=Payment.js.map