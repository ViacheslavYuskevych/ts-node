"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestErrorEnum = exports.RequestMethod = exports.ServerResponseClass = exports.ServerRequestClass = exports.ResponseType = void 0;
const node_http_1 = require("node:http");
var ResponseType;
(function (ResponseType) {
    ResponseType["JSON"] = "json";
})(ResponseType || (exports.ResponseType = ResponseType = {}));
class ServerRequestClass extends node_http_1.IncomingMessage {
    cookies = {};
    originalRoute = '';
    params = {};
    queryParams = {};
    method = RequestMethod.GET;
    getBody() {
        return new Promise((res) => res(null));
    }
    getFormData() {
        return new Promise((res) => res({ fields: {}, files: {} }));
    }
    data = {};
}
exports.ServerRequestClass = ServerRequestClass;
class ServerResponseClass extends node_http_1.ServerResponse {
    send(opts) { }
    cookies = [];
}
exports.ServerResponseClass = ServerResponseClass;
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "GET";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["DELETE"] = "DELETE";
})(RequestMethod || (exports.RequestMethod = RequestMethod = {}));
var RequestErrorEnum;
(function (RequestErrorEnum) {
    RequestErrorEnum["NOT_FOUND"] = "NOT_FOUND";
    RequestErrorEnum["SERVER_ERROR"] = "SERVER_ERROR";
    RequestErrorEnum["AUTH"] = "AUTH";
    RequestErrorEnum["CLIENT_ERROR"] = "CLIENT_ERROR";
    RequestErrorEnum["ACCESS_DENIED"] = "ACCESS_DENIED";
})(RequestErrorEnum || (exports.RequestErrorEnum = RequestErrorEnum = {}));
