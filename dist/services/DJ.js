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
}
exports.default = DJServices;
;
//# sourceMappingURL=DJ.js.map