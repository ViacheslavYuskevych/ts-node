"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
const formidable_1 = __importDefault(require("formidable"));
const index_js_1 = require("../types/index.js");
class Middleware {
    static addCookiesToHeaders(headers, cookies) {
        if (cookies?.length) {
            const cookiesStr = Middleware.buildCookies(cookies);
            headers['Set-Cookie'] = headers['Set-Cookie']
                ? `${headers['Set-Cookie']}; ${cookiesStr}`
                : cookiesStr;
        }
        return headers;
    }
    static responseMiddleware(res) {
        ;
        res.send = ({ statusCode, data, type, cookies, }) => {
            let response = null;
            let headers = {};
            switch (type) {
                case index_js_1.ResponseType.JSON:
                default:
                    response = JSON.stringify(data);
                    headers['Content-Type'] = 'application/json';
                    break;
            }
            headers = Middleware.addCookiesToHeaders(headers, [
                ...(cookies ?? []),
                ...(res.cookies ?? []),
            ]);
            res.writeHead(statusCode, headers);
            res.end(response);
        };
    }
    static buildCookies(cookies) {
        return cookies.map(({ key, value, isHttpOnly, isSecure, expires, path }) => {
            let cookie = `${key}=${value}`;
            if (isSecure)
                cookie += `; Secure`;
            if (isHttpOnly)
                cookie += `; HttpOnly`;
            if (expires)
                cookie += `; Expires=${expires}`;
            if (path)
                cookie += `; Path=${path}`;
            return cookie;
        });
    }
    static addGetFormDataToRequest(req) {
        ;
        req.getFormData = () => new Promise(async (resolve, reject) => {
            try {
                const form = (0, formidable_1.default)({});
                const [fields, files] = await form.parse(req);
                const res = {
                    fields: { ...fields },
                    files: { ...files },
                };
                resolve(res);
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
    static addGetBodyToRequest(req) {
        ;
        req.getBody = () => new Promise((resolve, reject) => {
            try {
                let body = '';
                req.on('data', (data) => {
                    body += data;
                });
                req.on('end', () => {
                    let json = {};
                    try {
                        if (body) {
                            json = JSON.parse(body);
                        }
                    }
                    catch (error) {
                        console.error(error);
                    }
                    resolve(json);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static addGetPayloadToRequest(req) {
        const contentType = req.headers['content-type']?.split(';')?.[0];
        switch (contentType) {
            case 'multipart/form-data':
                Middleware.addGetFormDataToRequest(req);
                break;
            default:
                Middleware.addGetBodyToRequest(req);
        }
    }
    static addParamsToRequest(req, router) {
        const requestRoute = router.getRoute(req);
        req.originalRoute = requestRoute;
        req.params = {};
        for (const route of router.routesWithParams) {
            const requestRoutes = requestRoute.split('/');
            const routes = route.split('/');
            if (requestRoutes.length !== routes.length)
                continue;
            const params = requestRoutes.reduce((params, r, i) => {
                if (!params)
                    return params;
                if (routes[i].startsWith(':')) {
                    const key = routes[i].replace(':', '');
                    params[key] = r;
                    return params;
                }
                return r === routes[i] ? params : null;
            }, {});
            if (params) {
                req.originalRoute = route;
                req.params = params;
                return;
            }
        }
    }
    static addQueryParamsToRequest(req) {
        const paramsInString = req.url?.split('?')[1];
        if (!paramsInString)
            return;
        const queryParams = JSON.parse('{"' +
            decodeURI(paramsInString.replace(/&/g, '","').replace(/=/g, '":"')) +
            '"}');
        req.queryParams = queryParams;
    }
    static setCookiesToRequest(req) {
        console.log('req.headers', req.headers);
        if (!req.headers.cookie)
            return;
        const cookies = {};
        for (const str of req.headers.cookie.split(';')) {
            const [key, value] = str.trim().split('=');
            cookies[key] = value;
        }
        req.cookies = cookies;
    }
    static requestMiddleware(req, { router }) {
        Middleware.addGetPayloadToRequest(req);
        Middleware.addParamsToRequest(req, router);
        Middleware.addQueryParamsToRequest(req);
        Middleware.setCookiesToRequest(req);
    }
    static use(req, res, options) {
        Middleware.requestMiddleware(req, options);
        Middleware.responseMiddleware(res);
    }
}
exports.Middleware = Middleware;
function returnKeyValObj(arr) {
    if (!Array.isArray(arr) || arr.length < 2)
        return false;
    let propKey = '';
    const formDataEntries = {};
    const [pKey, ...pValArray] = arr;
    // pValArray[0] ends with \r\n (2 characters total)
    const propVal = pValArray[0].slice(0, -2);
    // pKey looks like '\r\nname=\"key\"', where \r and \n and \" count as one character each
    // So, need to remove 8 from start of pKey and 1 from end of pKey
    if (pKey && pKey.includes('name="'))
        propKey = pKey.slice(8).slice(0, -1);
    if (propKey)
        formDataEntries[propKey] = propVal;
    if (Object.keys(formDataEntries).length)
        return formDataEntries;
    return false;
}
