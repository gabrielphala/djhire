import jsonwebtoken from "jsonwebtoken"

class JWT {
    private _jwt: any;
    static instance: JWT;

    constructor (jwt: object) {
        if (JWT.instance == null) {
            this._jwt = jwt;

            JWT.instance = this;
        }

        return JWT.instance;

    };

    get_cookie_tokens (data: object) {
        return {
            jwtAccess: this.get_access_token(data),
            jwtRefresh: this.get_refresh_token(data)
        }
    }

    get_refresh_token = (data: any) => (
        this._jwt.sign(data, process.env.JWT_REFRESH_TKN)
    );

    get_access_token = (data: any, expiresIn = '2h') => (
        this._jwt.sign(data, process.env.JWT_ACC_TKN, { expiresIn })
    );

    verify = (token: object, callback: Function) => {
        this._jwt.verify(token, process.env.JWT_ACC_TKN, (err: any, data: object) => {
            callback(data);
        });
    };

    verify_refresh = (token: object, callback: Function) => {
        this._jwt.verify(token, process.env.JWT_REFRESH_TKN, (err: any, data: object) => {
            callback(data);
        });
    };
}

export default new JWT(jsonwebtoken);