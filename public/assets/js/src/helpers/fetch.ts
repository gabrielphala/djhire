interface IOptions {
    path: string;
    content: string;
    [key: string]: any
}

export default async (uri: string, { method = 'POST', headers = { 'Content-Type': 'application/json;charset=utf-8' }, body = {} } = {}) => {
    const response = await fetch(uri, { method, headers, body: JSON.stringify(body) });

    return await response.json();
};  

export const uploadImage = async (url, body) => {
    return await (await fetch(url, {
        method: 'POST',
        body
    })).json()
}