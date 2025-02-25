import { ServerResponse } from 'node:http'
import { RequestErrorEnum } from '../types/index.js'

export class RequestErrors {
  private static readonly _statusCodes: Record<RequestErrorEnum, number> = {
    [RequestErrorEnum.NOT_FOUND]: 404,
    [RequestErrorEnum.SERVER_ERROR]: 500,
    [RequestErrorEnum.AUTH]: 401,
    [RequestErrorEnum.CLIENT_ERROR]: 400,
    [RequestErrorEnum.ACCESS_DENIED]: 403,
  }
  private static readonly _messages: Record<RequestErrorEnum, string> = {
    [RequestErrorEnum.NOT_FOUND]: 'Route is not found!',
    [RequestErrorEnum.SERVER_ERROR]: 'Internal server error!',
    [RequestErrorEnum.AUTH]: 'You are not authorized!',
    [RequestErrorEnum.CLIENT_ERROR]: 'You are provided wrong data!',
    [RequestErrorEnum.ACCESS_DENIED]: 'You do not have enough permission!',
  }

  public static throw(
    res: ServerResponse,
    type: RequestErrorEnum,
    customMessage?: string
  ) {
    const statusCode = RequestErrors._statusCodes[type]
    const message = customMessage ?? RequestErrors._messages[type]
    res.writeHead(statusCode)
    res.end(JSON.stringify({ message }))
  }
}
