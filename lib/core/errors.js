"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestErrors = void 0;
const index_js_1 = require("../types/index.js");
class RequestErrors {
    static _statusCodes = {
        [index_js_1.RequestErrorEnum.NOT_FOUND]: 404,
        [index_js_1.RequestErrorEnum.SERVER_ERROR]: 500,
        [index_js_1.RequestErrorEnum.AUTH]: 401,
        [index_js_1.RequestErrorEnum.CLIENT_ERROR]: 400,
        [index_js_1.RequestErrorEnum.ACCESS_DENIED]: 403,
    };
    static _messages = {
        [index_js_1.RequestErrorEnum.NOT_FOUND]: 'Route is not found!',
        [index_js_1.RequestErrorEnum.SERVER_ERROR]: 'Internal server error!',
        [index_js_1.RequestErrorEnum.AUTH]: 'You are not authorized!',
        [index_js_1.RequestErrorEnum.CLIENT_ERROR]: 'You are provided wrong data!',
        [index_js_1.RequestErrorEnum.ACCESS_DENIED]: 'You do not have enough permission!',
    };
    static throw(res, type, customMessage) {
        const statusCode = RequestErrors._statusCodes[type];
        const message = customMessage ?? RequestErrors._messages[type];
        res.writeHead(statusCode);
        res.end(JSON.stringify({ message }));
    }
}
exports.RequestErrors = RequestErrors;
