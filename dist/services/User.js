"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventServices {
    static async getUserBySession(wrapRes, body, { userInfo }) {
        try {
            wrapRes.userInfo = userInfo;
            wrapRes.successful = true;
        }
        catch (e) {
            throw e;
        }
        return wrapRes;
    }
}
exports.default = EventServices;
;
//# sourceMappingURL=User.js.map