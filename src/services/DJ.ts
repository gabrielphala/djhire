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

            if ((await DJ.exists({ stage_name })).found)
                throw 'Stage name already taken';

            if ((await DJ.exists({ email })).found)
                throw 'Email address already taken';

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

    static async searchByName (wrapRes: IResponse, body: IAny): Promise<IResponse> {
        try {
            const { dj_name } = body;

            wrapRes.djs = await DJ.search({
                condition: {
                    stage_name: dj_name
                }
            })

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async updateGeneralDetails (wrapRes: IResponse, body: IAny, { userInfo } : IAny) : Promise <IResponse> {
        try {
            const { stage_name, email } = body;

            if ((await DJ.exists({ id: { $ne: userInfo.id }, stage_name })).found)
                throw 'Stage name already taken';

            if ((await DJ.exists({ id: { $ne: userInfo.id }, email })).found)
                throw 'Email address already taken';
            
           v.validate({
                'stage name': { value: stage_name, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 }
            });

            DJ.updateUser(userInfo.id, {
                stage_name,
                email
            })

            const djDetails = await DJ.findOne({
                condition: { id: userInfo.id }
            })

            let details = djDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);

            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }

    static async updateProfile (body: IAny, req: IAny, res: IAny) {
        try {
            await DJ.updateUser(req.store.userInfo.id, {
                profile: req.files[0].filename
            })

            const djDetails = await DJ.findOne({
                condition: { id: req.store.userInfo.id }
            })

            let details = djDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);

            res.cookie('dj_user', tokens);

            req.successful = true;

        } catch (e) { throw e; }
    }

    static async updateRates (wrapRes: IResponse, body: IAny, { userInfo } : IAny) : Promise <IResponse> {
        try {
            const { min_deposit, full_amount } = body;
            
            v.validate({
                'Min deposit': { value: min_deposit },
                'Full amount': { value: full_amount },
            });

            DJ.updateUser(userInfo.id, {
                min_deposit: parseFloat(min_deposit),
                full_amount: parseFloat(full_amount)
            })

            const djDetails = await DJ.findOne({
                condition: { id: userInfo.id }
            })

            let details = djDetails.toObject()

            const tokens = jwt.get_cookie_tokens(details);

            wrapRes.set_cookie('dj_user', tokens);

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};