"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    res_wrap;
    constructor(res_wrap) {
        this.res_wrap = res_wrap;
        this.res_wrap = res_wrap;
    }
    get res() {
        return this.res_wrap;
    }
    render = (title) => (req, res) => {
        res.render('base', {
            page: {
                title
            },
            query: req.query
        });
    };
    signOut = (req, res) => {
        res.clearCookie('dj_user');
        res.redirect('/sign-in');
    };
    signOutOrganizer = (req, res) => {
        res.clearCookie('dj_user');
        res.redirect('/organizer/sign-in');
    };
    wrap = (service_method) => (req, res) => {
        this.res_wrap(async (response) => {
            return await service_method(response, req.body);
        }, res);
    };
    wrap_with_store = (service_method) => (req, res) => {
        this.res_wrap(async (response) => {
            return await service_method(response, req.body, req.store || {});
        }, res);
    };
    wrap_with_request = (service_method) => (req, res) => {
        this.res_wrap(async (response) => {
            return await service_method(response, req.body, req);
        }, res);
    };
}
exports.default = BaseController;
//# sourceMappingURL=base.js.map