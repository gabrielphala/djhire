"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DJ_1 = __importDefault(require("../models/DJ"));
const Validation_1 = __importDefault(require("../helpers/Validation"));
const Hasher_1 = __importDefault(require("../helpers/Hasher"));
const Jwt_1 = __importDefault(require("../helpers/Jwt"));
class DJServices {
    static async signUp(wrapRes, body) {
        try {
            const { stage_name, email, password, passwordAgain } = body;
            Validation_1.default.validate({
                'stage name': { value: stage_name, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
                'confirmation password': { value: passwordAgain, is: ['password', 'Passwords do not match'] }
            });
            if ((await DJ_1.default.exists({ stage_name })).found)
                throw 'Stage name already taken';
            if ((await DJ_1.default.exists({ email })).found)
                throw 'Email address already taken';
            const djDetails = await DJ_1.default.insert({
                stage_name,
                email,
                password: await Hasher_1.default.hash(password)
            });
            delete djDetails.password;
            let details = djDetails.toObject();
            const tokens = Jwt_1.default.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);
            wrapRes.userDetails = details;
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async signIn(wrapRes, body) {
        try {
            const { identifier, password } = body;
            Validation_1.default.validate({
                'stage name or email': { value: identifier, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
            });
            const djDetails = await DJ_1.default.findOne({
                condition: [
                    { email: identifier },
                    { stage_name: identifier },
                ]
            });
            if (!djDetails)
                throw 'Stage name, email address, or password is incorrect';
            if (!(await Hasher_1.default.isSame(djDetails.password, password)))
                throw 'Stage name, email address, or password is incorrect';
            delete djDetails.password;
            let details = djDetails.toObject();
            const tokens = Jwt_1.default.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);
            wrapRes.userDetails = details;
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async searchByName(wrapRes, body) {
        try {
            const { dj_name } = body;
            wrapRes.djs = await DJ_1.default.search({
                condition: {
                    stage_name: dj_name
                }
            });
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async updateGeneralDetails(wrapRes, body, { userInfo }) {
        try {
            const { stage_name, email } = body;
            if ((await DJ_1.default.exists({ id: { $ne: userInfo.id }, stage_name })).found)
                throw 'Stage name already taken';
            if ((await DJ_1.default.exists({ id: { $ne: userInfo.id }, email })).found)
                throw 'Email address already taken';
            Validation_1.default.validate({
                'stage name': { value: stage_name, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 }
            });
            DJ_1.default.updateUser(userInfo.id, {
                stage_name,
                email
            });
            const djDetails = await DJ_1.default.findOne({
                condition: { id: userInfo.id }
            });
            let details = djDetails.toObject();
            const tokens = Jwt_1.default.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
    static async updateProfile(body, req, res) {
        try {
            await DJ_1.default.updateUser(req.store.userInfo.id, {
                profile: req.files[0].filename
            });
            const djDetails = await DJ_1.default.findOne({
                condition: { id: req.store.userInfo.id }
            });
            let details = djDetails.toObject();
            const tokens = Jwt_1.default.get_cookie_tokens(details);
            res.cookie('dj_user', tokens);
            req.successful = true;
        }
        catch (e) {
            throw e;
        }
    }
    static async updateRates(wrapRes, body, { userInfo }) {
        try {
            const { min_deposit, full_amount } = body;
            Validation_1.default.validate({
                'Min deposit': { value: min_deposit },
                'Full amount': { value: full_amount },
            });
            DJ_1.default.updateUser(userInfo.id, {
                min_deposit: parseFloat(min_deposit),
                full_amount: parseFloat(full_amount)
            });
            const djDetails = await DJ_1.default.findOne({
                condition: { id: userInfo.id }
            });
            let details = djDetails.toObject();
            const tokens = Jwt_1.default.get_cookie_tokens(details);
            wrapRes.set_cookie('dj_user', tokens);
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
}
exports.default = DJServices;
;
//# sourceMappingURL=DJ.js.map