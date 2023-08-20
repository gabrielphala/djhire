"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponse = void 0;
const getResponse = (res) => ({
    error: null,
    successful: false,
    set_cookie: (name, value) => {
        res.cookie(name, value);
    }
});
exports.getResponse = getResponse;
exports.default = async (callback, res) => {
    let response = (0, exports.getResponse)(res);
    try {
        response = await callback(response);
    }
    catch (e) {
        console.log(e);
        response.error = typeof e == 'object' ? 'Something went wrong, please try again later!' : e;
    }
    delete response.set_cookie;
    res.status(200).json(response);
};
//# sourceMappingURL=response-wrap.js.map