import formidable from 'formidable';
import { IncomingMessage, ServerResponse as HttpServerResponse } from 'node:http';
type ServerRequestExtra = {
    method: RequestMethod;
    getBody: <T = any>() => Promise<T>;
};
export declare enum ResponseType {
    JSON = "json"
}
export type ICookie = {
    key: string;
    value: string;
    expires?: Date;
    path?: string;
    isSecure?: boolean;
    isHttpOnly?: boolean;
    domain?: string;
};
type ServerResponseExtra = {
    send: (opts: {
        statusCode: 200 | 201;
        data: any;
        type?: ResponseType;
        cookies?: ICookie[];
    }) => void;
    req: ServerRequest;
};
export declare class ServerRequestClass extends IncomingMessage implements ServerRequestExtra {
    cookies: Record<string, string>;
    originalRoute: string;
    params: Record<string, string>;
    queryParams: Record<string, string>;
    method: RequestMethod;
    getBody<T = any>(): Promise<T>;
    getFormData(): Promise<IParsedFormData>;
    data: Record<string, any>;
}
export declare class ServerResponseClass extends HttpServerResponse implements ServerResponseExtra {
    send(opts: {
        statusCode: 200 | 201;
        data: any;
        type?: ResponseType;
        cookies?: ICookie[];
    }): void;
    cookies: ICookie[];
    req: any;
}
export type ServerRequest = typeof ServerRequestClass;
export type ServerResponse = typeof ServerResponseClass;
export declare enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}
export type RequestListener = (req: ServerRequestClass, res: ServerResponseClass, next?: () => Promise<void> | void) => Promise<void> | void;
export type RouterListeners = Record<string, Partial<Record<RequestMethod, RequestListener>>>;
export interface IRequestListenerHolder {
    get: (path: string, listener: RequestListener) => void;
    post: (path: string, listener: RequestListener) => void;
    delete: (path: string, listener: RequestListener) => void;
    put: (path: string, listener: RequestListener) => void;
    patch: (path: string, listener: RequestListener) => void;
}
export declare enum RequestErrorEnum {
    NOT_FOUND = "NOT_FOUND",
    SERVER_ERROR = "SERVER_ERROR",
    AUTH = "AUTH",
    CLIENT_ERROR = "CLIENT_ERROR",
    ACCESS_DENIED = "ACCESS_DENIED"
}
interface IParsedFormData {
    fields: Record<string, string[] | undefined>;
    files: Record<string, formidable.File[] | undefined>;
}
export {};
//# sourceMappingURL=index.d.ts.map