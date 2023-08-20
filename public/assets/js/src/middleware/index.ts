import { Middleware, Router, Environment } from "oddlyjs"
import fetch from "../helpers/fetch";

export default () => {
    Middleware.repeat(async (next: Function) => {
        // Environment.put(
        //     'userDetails',
        //     (await fetch('/user/get/by/session')).details,
        //     true
        // )

        next()
    })
}