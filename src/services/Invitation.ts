import Invitation from "../models/Invitation"
import Payment from "../models/Payment";

import { IAny, IResponse } from "../interfaces";
import { makeId } from "../helpers/String";

export default class InvitationServices {
    static async add (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            const { dj_id, event_id } = body;

            if ((await Invitation.exists({ dj_id, event_id, isDeleted: false })).found)
                throw 'Invitation already sent';

            Invitation.insert({
                invitation_no: makeId(5),
                dj_id,
                event_id,
                organizer_id: userInfo.id
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async accept (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        const { event_id, organizer_id } = body;

        try {
            if ((await Payment.exists({ organizer_id, event_id })).found)
                throw 'Already accepted';

            const invite = await Invitation.findOne({
                condition: {
                    organizer_id,
                    event_id,
                    isDeleted: false
                }
            })

            invite.status = 'Accepted';

            invite.save()

            Payment.insert({
                event_id,
                dj_id: userInfo.id,
                organizer_id
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    } 

    static async deny (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        const { event_id, organizer_id } = body;

        try {
            const invite = await Invitation.findOne({
                condition: {
                    organizer_id,
                    event_id,
                    isDeleted: false
                }
            })

            invite.status = 'Declined';

            invite.save()

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    } 

    static async getOpenDJInvitations (wrapRes: IResponse, body: IAny, req: IAny) : Promise <IResponse> {
        try {
            const { dj_id } = req.params;

            wrapRes.invitations = await Invitation.getOpenDJInvitations(dj_id)

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async getEventInvitees (wrapRes: IResponse, body: IAny, req: IAny) : Promise <IResponse> {
        try {
            const { event_id } = req.params;

            wrapRes.invitees = await Invitation.getEventInvitees(event_id)

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async removeById (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { invitation_id } = body;

           Invitation.update({ id: invitation_id }, {
                isDeleted: true
           })

        } catch (e) { throw e; }

        return wrapRes;
    }
};