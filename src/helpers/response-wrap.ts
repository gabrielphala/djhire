import { Response } from "express";
import { IResponse } from "../interfaces"

export const getResponse = (res: Response) : IResponse => ({
    error: null,
    successful: false,

    set_cookie: (name: string, value: any) => {
        res.cookie(name, value);
    }
});

export default async (callback: Function, res: Response) => {
    let response = getResponse(res);

    try {
        response = await callback(response);
    } catch (e) {
        console.log(e);

        response.error = typeof e == 'object' ? 'Something went wrong, please try again later!' : e;
    }

    delete response.set_cookie

    res.status(200).json(response)
};
