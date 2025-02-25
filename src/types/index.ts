import formidable from 'formidable'
import {
  IncomingMessage,
  ServerResponse as HttpServerResponse,
} from 'node:http'

type ServerRequestExtra = {
  method: RequestMethod
  getBody: <T = any>() => Promise<T>
}

export enum ResponseType {
  JSON = 'json',
}

export type ICookie = {
  key: string
  value: string
  expires?: Date
  path?: string
  isSecure?: boolean
  isHttpOnly?: boolean
  domain?: string
}

type ServerResponseExtra = {
  send: (opts: {
    statusCode: 200 | 201
    data: any
    type?: ResponseType
    cookies?: ICookie[]
  }) => void
  req: ServerRequest
}

export class ServerRequestClass
  extends IncomingMessage
  implements ServerRequestExtra
{
  cookies: Record<string, string> = {}
  originalRoute: string = ''
  params: Record<string, string> = {}
  queryParams: Record<string, string> = {}
  method: RequestMethod = RequestMethod.GET
  getBody<T = any>() {
    return new Promise<T>((res) => res(null as T))
  }
  getFormData() {
    return new Promise<IParsedFormData>((res) =>
      res({ fields: {}, files: {} } as IParsedFormData)
    )
  }
  data: Record<string, any> = {}
}

export class ServerResponseClass
  extends HttpServerResponse
  implements ServerResponseExtra
{
  send(opts: {
    statusCode: 200 | 201
    data: any
    type?: ResponseType
    cookies?: ICookie[]
  }) {}
  cookies: ICookie[] = []
  declare req: any
}

export type ServerRequest = typeof ServerRequestClass

export type ServerResponse = typeof ServerResponseClass

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type RequestListener = (
  req: ServerRequestClass,
  res: ServerResponseClass,
  next?: () => Promise<void> | void
) => Promise<void> | void

export type RouterListeners = Record<
  string,
  Partial<Record<RequestMethod, RequestListener>>
>

export interface IRequestListenerHolder {
  get: (path: string, listener: RequestListener) => void
  post: (path: string, listener: RequestListener) => void
  delete: (path: string, listener: RequestListener) => void
  put: (path: string, listener: RequestListener) => void
  patch: (path: string, listener: RequestListener) => void
}

export enum RequestErrorEnum {
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTH = 'AUTH',
  CLIENT_ERROR = 'CLIENT_ERROR',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

interface IParsedFormData {
  fields: Record<string, string[] | undefined>
  files: Record<string, formidable.File[] | undefined>
}
