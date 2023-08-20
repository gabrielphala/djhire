"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWT {
    _jwt;
    static instance;
    constructor(jwt) {
        if (JWT.instance == null) {
            this._jwt = jwt;
            JWT.instance = this;
        }
        return JWT.instance;
    }
    ;
    get_cookie_tokens(data) {
        return {
            jwtAccess: this.get_access_token(data),
            jwtRefresh: this.get_refresh_token(data)
        };
    }
    get_refresh_token = (data) => (this._jwt.sign(data, process.env.JWT_REFRESH_TKN));
    get_access_token = (data, expiresIn = '2h') => (this._jwt.sign(data, process.env.JWT_ACC_TKN, { expiresIn }));
    verify = (token, callback) => {
        this._jwt.verify(token, process.env.JWT_ACC_TKN, (err, data) => {
            callback(data);
        });
    };
    verify_refresh = (token, callback) => {
        this._jwt.verify(token, process.env.JWT_REFRESH_TKN, (err, data) => {
            callback(data);
        });
    };
}
exports.default = new JWT(jsonwebtoken_1.default);
//# sourceMappingURL=Jwt.js.map