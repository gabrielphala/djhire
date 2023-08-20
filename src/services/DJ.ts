import DJ from "../models/DJ"

import v from "../helpers/Validation"
import hasher from "../helpers/Hasher"
import jwt from "../helpers/Jwt"

import { IAny, IResponse } from "../interfaces";

export default class DJServices {
    static async signUp (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { stage_name, email, password, passwordAgain } = body;
            
            v.validate({
                'stage name': { value: stage_name, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
                'confirmation password': { value: passwordAgain, is: ['password', 'Passwords do not match'] }
            });

            const djDetails = await DJ.insert({
                stage_name,
                email,
                password: await hasher.hash(password)
            })

            delete djDetails.password;

            let details = djDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.userDetails = details;
            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async signIn (wrapRes: IResponse, body: IAny) : Promise <IResponse> {
        try {
            const { identifier, password } = body;
            
            v.validate({
                'stage name or email': { value: identifier, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
            });

            const djDetails = await DJ.findOne({
                condition: [
                    { email: identifier },
                    { stage_name: identifier },
                ]
            })

            if (!djDetails) throw 'Stage name, email address, or password is incorrect';

            if (!(await hasher.isSame(djDetails.password, password)))
                throw 'Stage name, email address, or password is incorrect'

            delete djDetails.password;

            let details = djDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.userDetails = details;
            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};