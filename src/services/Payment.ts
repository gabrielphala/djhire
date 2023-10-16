import Payment from "../models/Payment";
import DJ from "../models/DJ";

import { IAny, IResponse } from "../interfaces";

export default class OrganizerServices {
    static async getByOrganizer (wrapRes: IResponse, body: IAny, { userInfo } : IAny) : Promise <IResponse> {
        try {
            const payments = await Payment.getByOrganizer(userInfo.id)

            wrapRes.payments = payments;
            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async pay (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { id, amount } = body;

            const payment = await Payment.findOne({
                condition: { id }
            })

            if (!payment) return;

            const dj = await DJ.findOne({
                condition: { id: payment.dj_id }
            })

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

        } catch (e) { throw e; }

        return wrapRes;
    }
};