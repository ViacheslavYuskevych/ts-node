import http from 'node:http';
import { IRequestListenerHolder, RequestListener, ServerRequest, ServerResponse } from './types/index.js';
import { Router } from './core/router.js';
export declare class Express implements IRequestListenerHolder {
    private readonly _router;
    private readonly _server;
    constructor();
    listen(port: number, handler?: () => void): http.Server<ServerRequest, ServerResponse>;
    use(middleware: RequestListener): void;
    useRouter(path: string, router: Router): void;
    get(path: string, listener: RequestListener): void;
    post(path: string, listener: RequestListener): void;
    delete(path: string, listener: RequestListener): void;
    put(path: string, listener: RequestListener): void;
    patch(path: string, listener: RequestListener): void;
}
//# sourceMappingURL=express.d.ts.map