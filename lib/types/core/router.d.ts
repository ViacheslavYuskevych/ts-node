import { IRequestListenerHolder, RequestListener, RouterListeners, ServerRequestClass, ServerResponseClass } from '../types/index.js';
export declare class Router implements IRequestListenerHolder {
    private readonly _listeners;
    private readonly _middlewares;
    get listeners(): RouterListeners;
    get middlewares(): RequestListener[];
    get routesWithParams(): string[];
    private findListener;
    private runListenerStack;
    private getListenerStack;
    handle(req: ServerRequestClass, res: ServerResponseClass): Promise<void>;
    get(path: string, listener: RequestListener): void;
    post(path: string, listener: RequestListener): void;
    delete(path: string, listener: RequestListener): void;
    put(path: string, listener: RequestListener): void;
    patch(path: string, listener: RequestListener): void;
    private combinePaths;
    addNestedRouter(path1: string, router: Router): void;
    use(middleware: RequestListener): void;
    private addListener;
    getRoute(req: ServerRequestClass): string;
}
//# sourceMappingURL=router.d.ts.map