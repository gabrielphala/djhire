import { Request, Response } from "express";
import { IAny, IResponse } from "../../../interfaces";

export default class BaseController {
    constructor (private res_wrap: (c: Function, r: Response) => void) {
        this.res_wrap = res_wrap
    }

    get res () {
        return this.res_wrap;
    }

    render = (title: string) => (req: Request, res: Response) => {
        res.render('base', {
            page: {
                title
            },
            query: req.query
        });
    };

    signOut = (req: Request, res: Response) => {
        res.clearCookie('dj_user')

        res.redirect('/sign-in')
    };

    signOutOrganizer = (req: Request, res: Response) => {
        res.clearCookie('dj_user')

        res.redirect('/organizer/sign-in')
    };

    wrap = (service_method: (r: IResponse, b: IAny) => Promise<IResponse> | IResponse) => (req: Request, res: Response) => {
        this.res_wrap(async (response: IResponse) => {
            return await service_method(response, req.body)
        }, res)
    }

    wrap_with_store = (service_method: (r: IResponse, b: IAny, s: IAny) => Promise<IResponse> | IResponse) => (req: any, res: Response) => {
        this.res_wrap(async (response: IResponse) => {
            return await service_method(response, req.body, req.store || {})
        }, res)
    }

    wrap_with_request = (service_method: (r: IResponse, b: IAny, rq: Request) => Promise<IResponse> | IResponse) => (req: Request, res: Response) => {
        this.res_wrap(async (response: IResponse) => {
            return await service_method(response, req.body, req)
        }, res)
    }
}
