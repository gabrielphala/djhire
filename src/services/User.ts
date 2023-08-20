import { IAny, IResponse } from "../interfaces";

export default class EventServices {
    static async getUserBySession (wrapRes: IResponse, body: IAny, { userInfo }: IAny) : Promise <IResponse> {
        try {
            wrapRes.userInfo = userInfo;

            wrapRes.successful = true;

        } catch (e) { throw e; }

        return wrapRes;
    }
};