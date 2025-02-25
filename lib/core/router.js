"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const node_url_1 = __importDefault(require("node:url"));
const index_js_1 = require("../types/index.js");
const errors_js_1 = require("./errors.js");
class Router {
    _listeners = {};
    _middlewares = [];
    get listeners() {
        return this._listeners;
    }
    get middlewares() {
        return this._middlewares;
    }
    get routesWithParams() {
        return Object.keys(this._listeners).filter((route) => route.includes(':'));
    }
    findListener(req) {
        const route = this.getRoute(req);
        let listener = this._listeners[route]?.[req.method];
        if (listener)
            return listener;
        listener = this._listeners[req.originalRoute]?.[req.method];
        return listener ?? null;
    }
    async runListenerStack(req, res, stack) {
        const listener = stack.shift();
        if (!listener)
            return;
        const next = () => {
            this.runListenerStack(req, res, stack);
        };
        const listenResult = listener(req, res, next);
        if (listenResult instanceof Promise) {
            try {
                await listenResult;
            }
            catch (error) {
                errors_js_1.RequestErrors.throw(res, index_js_1.RequestErrorEnum.SERVER_ERROR, error?.message);
            }
        }
    }
    getListenerStack(listener, _middlewares = this._middlewares) {
        const listenerStack = [..._middlewares];
        if (listener)
            listenerStack.push(listener);
        else
            listenerStack.push((req, res) => {
                errors_js_1.RequestErrors.throw(res, index_js_1.RequestErrorEnum.NOT_FOUND);
            });
        return listenerStack;
    }
    async handle(req, res) {
        try {
            const listener = this.findListener(req);
            const listenerStack = this.getListenerStack(listener);
            this.runListenerStack(req, res, listenerStack);
        }
        catch (error) {
            errors_js_1.RequestErrors.throw(res, index_js_1.RequestErrorEnum.SERVER_ERROR, error?.message);
        }
    }
    get(path, listener) {
        this.addListener(path, index_js_1.RequestMethod.GET, listener);
    }
    post(path, listener) {
        this.addListener(path, index_js_1.RequestMethod.POST, listener);
    }
    delete(path, listener) {
        this.addListener(path, index_js_1.RequestMethod.DELETE, listener);
    }
    put(path, listener) {
        this.addListener(path, index_js_1.RequestMethod.PUT, listener);
    }
    patch(path, listener) {
        this.addListener(path, index_js_1.RequestMethod.PATCH, listener);
    }
    combinePaths(path1, path2) {
        if (path1.startsWith('/')) {
            if (path2.startsWith('/'))
                return `${path1}${path2}`;
            else
                return `${path1}/${path2}`;
        }
        else {
            if (path2.startsWith('/'))
                return `/${path1}${path2}`;
            else
                return `/${path1}/${path2}`;
        }
    }
    addNestedRouter(path1, router) {
        for (const [path2, listenersByMethod] of Object.entries(router.listeners))
            for (const [method, listener] of Object.entries(listenersByMethod)) {
                const path = this.combinePaths(path1, path2);
                const nestedListener = (req, res) => {
                    const listenerStack = this.getListenerStack(listener, router.middlewares);
                    this.runListenerStack(req, res, listenerStack);
                };
                switch (method) {
                    case index_js_1.RequestMethod.GET:
                        this.get(path, nestedListener);
                        break;
                    case index_js_1.RequestMethod.POST:
                        this.post(path, nestedListener);
                        break;
                    case index_js_1.RequestMethod.DELETE:
                        this.delete(path, nestedListener);
                        break;
                    case index_js_1.RequestMethod.PATCH:
                        this.patch(path, nestedListener);
                        break;
                    case index_js_1.RequestMethod.PUT:
                        this.put(path, nestedListener);
                        break;
                }
            }
    }
    use(middleware) {
        this._middlewares.push(middleware);
    }
    addListener(path, method, listener) {
        if (!this._listeners[path])
            this._listeners[path] = {};
        this._listeners[path][method] = listener;
    }
    getRoute(req) {
        if (!req.url)
            throw new Error();
        const pathname = node_url_1.default.parse(req.url).pathname;
        if (!pathname)
            throw new Error();
        return pathname;
    }
}
exports.Router = Router;
