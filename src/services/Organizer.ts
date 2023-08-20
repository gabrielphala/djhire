import Organizer from "../models/Organizer"

import v from "../helpers/Validation"
import hasher from "../helpers/Hasher"
import jwt from "../helpers/Jwt"

import { IAny, IResponse } from "../interfaces";

export default class OrganizerServices {
    static async signUp (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { fullname, email, password, passwordAgain } = body;
            
            v.validate({
                'full name': { value: fullname, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
                'confirmation password': { value: passwordAgain, is: ['password', 'Passwords do not match'] }
            });

            const organizerDetails = await Organizer.insert({
                fullname,
                email,
                password: await hasher.hash(password)
            })

            delete organizerDetails.password;

            let details = organizerDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.userDetails = details;
            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async signIn (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { email, password } = body;
            
            v.validate({
                'email address': { value: email, min: 5, max: 50 },
                'password': { value: password, min: 8, max: 16 },
            });

            const organizerDetails = await Organizer.findOne({
                condition: { email }
            })

            if (!organizerDetails) throw 'Email address, or password is incorrect';

            if (!(await hasher.isSame(organizerDetails.password, password)))
                throw 'Email address, or password is incorrect'

            delete organizerDetails.password;

            let details = organizerDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.userDetails = details;
            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};