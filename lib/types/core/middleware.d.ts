import { ServerResponse as HttpServerResponse, IncomingMessage } from 'node:http';
import { Router } from './router.js';
export declare class Middleware {
    private static addCookiesToHeaders;
    private static responseMiddleware;
    private static buildCookies;
    private static addGetFormDataToRequest;
    private static addGetBodyToRequest;
    private static addGetPayloadToRequest;
    private static addParamsToRequest;
    private static addQueryParamsToRequest;
    private static setCookiesToRequest;
    private static requestMiddleware;
    static use(req: IncomingMessage, res: HttpServerResponse, options: IOptions): void;
}
interface IOptions {
    router: Router;
}
export {};
//# sourceMappingURL=middleware.d.ts.map