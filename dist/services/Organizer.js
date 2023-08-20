"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Validation_1 = __importDefault(require("../helpers/Validation"));
const Hasher_1 = __importDefault(require("../helpers/Hasher"));
const Jwt_1 = __importDefault(require("../helpers/Jwt"));
class OrganizerServices {
    static async signUp(wrapRes, body) {
        try {
            const { fullname, email, password, passwordAgain } = body;
            Validation_1.default.validate({
                'full name': { value: fullname, min: 5, max: 36 },
                'email address': { value: email, min: 5, max: 46 },
                'password': { value: password, min: 8, max: 16 },
                'confirmation password': { value: passwordAgain, is: ['password', 'Passwords do not match'] }
            });
            const organizerDetails = await Organizer_1.default.insert({
                fullname,
                email,
                password: await Hasher_1.default.hash(password)
            });
            delete organizerDetails.password;
            let details = organizerDetails.toObject();
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
            const { email, password } = body;
            Validation_1.default.validate({
                'email address': { value: email, min: 5, max: 50 },
                'password': { value: password, min: 8, max: 16 },
            });
            const organizerDetails = await Organizer_1.default.findOne({
                condition: { email }
            });
            if (!organizerDetails)
                throw 'Email address, or password is incorrect';
            if (!(await Hasher_1.default.isSame(organizerDetails.password, password)))
                throw 'Email address, or password is incorrect';
            delete organizerDetails.password;
            let details = organizerDetails.toObject();
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
exports.default = OrganizerServices;
;
//# sourceMappingURL=Organizer.js.map