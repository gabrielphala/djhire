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

    static async getEventsByOrganizer (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            wrapRes.events = await Event.find({
                condition: { organizer_id: userInfo.id }
            })

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};