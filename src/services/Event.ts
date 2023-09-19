import Event from "../models/Event"

import v from "../helpers/Validation"

import { IAny, IResponse } from "../interfaces";

export default class EventServices {
    static async add (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            const { name, location, start, end } = body;
            
            v.validate({
                'name': { value: name, min: 3, max: 50 },
                'location': { value: location, min: 5, max: 255 }
            });

            await Event.insert({
                name,
                location,
                organizer_id: userInfo.id,
                start: new Date(`${start + ':00.000+02:00'}`),
                end: new Date(`${end + ':00.000+02:00'}`)
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async edit (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { name, location, start, end, event_id } = body;
            
            v.validate({
                'name': { value: name, min: 3, max: 50 },
                'location': { value: location, min: 5, max: 255 }
            });

            await Event.update({ id: event_id }, {
                name,
                location,
                start: new Date(`${start + ':00.000+02:00'}`),
                end: new Date(`${end + ':00.000+02:00'}`)
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async getById (wrapRes: IResponse, _: IAny, req: IAny) : Promise <IResponse> {
        try {
            const { event_id } = req.params;

            const details = await Event.findOne({
                condition: {
                    id: event_id
                }
            });

            wrapRes.details = details ? details.toObject() : null;

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async removeEvent (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { event_id } = body;

            await Event.removeEvent(event_id);

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async getEventsByOrganizer (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            wrapRes.events = await Event.find({
                condition: { organizer_id: userInfo.id, isDeleted: false }
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};