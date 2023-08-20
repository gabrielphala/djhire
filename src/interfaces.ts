export interface IAny {
    [key: string]: any
}

export interface IResponse {
    error: string | null,
    successful: boolean,
    set_cookie: Function,
    [key: string]: any
}