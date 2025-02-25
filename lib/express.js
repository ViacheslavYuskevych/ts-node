"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Express = void 0;
const node_http_1 = __importDefault(require("node:http"));
const middleware_js_1 = require("./core/middleware.js");
const router_js_1 = require("./core/router.js");
class Express {
    _router = new router_js_1.Router();
    _server;
    constructor() {
        this._server = node_http_1.default.createServer((req, res) => {
            middleware_js_1.Middleware.use(req, res, { router: this._router });
            this._router.handle(req, res);
        });
    }
    listen(port, handler) {
        return this._server.listen(port, () => {
            handler?.();
        });
    }
    use(middleware) {
        this._router.use(middleware);
    }
    /* router */
    useRouter(path, router) {
        this._router.addNestedRouter(path, router);
    }
    get(path, listener) {
        this._router.get(path, listener);
    }
    post(path, listener) {
        this._router.post(path, listener);
    }
    delete(path, listener) {
        this._router.delete(path, listener);
    }
    put(path, listener) {
        this._router.put(path, listener);
    }
    patch(path, listener) {
        this._router.patch(path, listener);
    }
}
exports.Express = Express;
