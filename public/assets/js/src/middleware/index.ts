import { Middleware, Router, Environment } from "oddlyjs"
import fetch from "../helpers/fetch";

export default () => {
    Middleware.repeat(async (next: Function) => {
        Environment.put(
            'userInfo',
            (await fetch('/user/get/by/session')).userInfo,
            true
        )

        next()
    })
}