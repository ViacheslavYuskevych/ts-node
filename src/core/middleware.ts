import formidable from 'formidable'
import {
  ServerResponse as HttpServerResponse,
  IncomingMessage,
  OutgoingHttpHeaders,
} from 'node:http'
import {
  ServerResponseClass,
  ServerRequestClass,
  ResponseType,
  ICookie,
} from '../types/index.js'
import { Router } from './router.js'

export class Middleware {
  private static addCookiesToHeaders(
    headers: OutgoingHttpHeaders,
    cookies?: ICookie[]
  ) {
    if (cookies?.length) {
      const cookiesStr = Middleware.buildCookies(cookies)
      headers['Set-Cookie'] = headers['Set-Cookie']
        ? `${headers['Set-Cookie']}; ${cookiesStr}`
        : cookiesStr
    }

    return headers
  }

  private static responseMiddleware(res: ServerResponseClass) {
    ;(res as ServerResponseClass).send = ({
      statusCode,
      data,
      type,
      cookies,
    }: Parameters<ServerResponseClass['send']>['0']) => {
      let response: any = null
      let headers: OutgoingHttpHeaders = {}

      switch (type) {
        case ResponseType.JSON:
        default:
          response = JSON.stringify(data)
          headers['Content-Type'] = 'application/json'
          break
      }

      headers = Middleware.addCookiesToHeaders(headers, [
        ...(cookies ?? []),
        ...(res.cookies ?? []),
      ])

      res.writeHead(statusCode, headers)
      res.end(response)
    }
  }

  private static buildCookies(cookies: ICookie[]): string[] {
    return cookies.map(
      ({ key, value, isHttpOnly, isSecure, expires, path }) => {
        let cookie = `${key}=${value}`

        if (isSecure) cookie += `; Secure`
        if (isHttpOnly) cookie += `; HttpOnly`
        if (expires) cookie += `; Expires=${expires}`
        if (path) cookie += `; Path=${path}`

        return cookie
      }
    )
  }

  private static addGetFormDataToRequest(req: IncomingMessage) {
    ;(req as ServerRequestClass).getFormData = () =>
      new Promise(async (resolve, reject) => {
        try {
          const form = formidable({})

          const [fields, files] = await form.parse(req)

          const res: Awaited<ReturnType<ServerRequestClass['getFormData']>> = {
            fields: { ...fields },
            files: { ...files },
          }

          resolve(res)
        } catch (error) {
          console.error(error)
          reject(error)
        }
      })
  }

  private static addGetBodyToRequest(req: IncomingMessage) {
    ;(req as ServerRequestClass).getBody = () =>
      new Promise((resolve, reject) => {
        try {
          let body = ''

          req.on('data', (data) => {
            body += data
          })
          req.on('end', () => {
            let json = {}
            try {
              if (body) {
                json = JSON.parse(body)
              }
            } catch (error) {
              console.error(error)
            }
            resolve(json as any)
          })
        } catch (error) {
          reject(error)
        }
      })
  }

  private static addGetPayloadToRequest(req: IncomingMessage) {
    const contentType = req.headers['content-type']?.split(';')?.[0]

    switch (contentType) {
      case 'multipart/form-data':
        Middleware.addGetFormDataToRequest(req)
        break

      default:
        Middleware.addGetBodyToRequest(req)
    }
  }

  private static addParamsToRequest(req: ServerRequestClass, router: Router) {
    const requestRoute = router.getRoute(req)
    req.originalRoute = requestRoute
    req.params = {}

    for (const route of router.routesWithParams) {
      const requestRoutes = requestRoute.split('/')
      const routes = route.split('/')

      if (requestRoutes.length !== routes.length) continue

      const params = requestRoutes.reduce<Record<string, string> | null>(
        (params, r, i) => {
          if (!params) return params

          if (routes[i].startsWith(':')) {
            const key = routes[i].replace(':', '')
            params[key] = r
            return params
          }
          return r === routes[i] ? params : null
        },
        {}
      )

      if (params) {
        req.originalRoute = route
        req.params = params
        return
      }
    }
  }

  private static addQueryParamsToRequest(req: ServerRequestClass) {
    const paramsInString = req.url?.split('?')[1]

    if (!paramsInString) return

    const queryParams = JSON.parse(
      '{"' +
        decodeURI(paramsInString.replace(/&/g, '","').replace(/=/g, '":"')) +
        '"}'
    )

    req.queryParams = queryParams
  }

  private static setCookiesToRequest(req: ServerRequestClass) {
    console.log('req.headers', req.headers)
    if (!req.headers.cookie) return

    const cookies: ServerRequestClass['cookies'] = {}

    for (const str of req.headers.cookie.split(';')) {
      const [key, value] = str.trim().split('=')
      cookies[key] = value
    }

    req.cookies = cookies
  }

  private static requestMiddleware(req: IncomingMessage, { router }: IOptions) {
    Middleware.addGetPayloadToRequest(req)
    Middleware.addParamsToRequest(req as ServerRequestClass, router)
    Middleware.addQueryParamsToRequest(req as ServerRequestClass)
    Middleware.setCookiesToRequest(req as ServerRequestClass)
  }

  public static use(
    req: IncomingMessage,
    res: HttpServerResponse,
    options: IOptions
  ) {
    Middleware.requestMiddleware(req, options)
    Middleware.responseMiddleware(res as ServerResponseClass)
  }
}

interface IOptions {
  router: Router
}

function returnKeyValObj(arr: Array<string>) {
  if (!Array.isArray(arr) || arr.length < 2) return false
  let propKey = ''
  const formDataEntries: { [key: string]: string } = {}
  const [pKey, ...pValArray] = arr
  // pValArray[0] ends with \r\n (2 characters total)
  const propVal = pValArray[0].slice(0, -2)
  // pKey looks like '\r\nname=\"key\"', where \r and \n and \" count as one character each
  // So, need to remove 8 from start of pKey and 1 from end of pKey
  if (pKey && pKey.includes('name="')) propKey = pKey.slice(8).slice(0, -1)
  if (propKey) formDataEntries[propKey] = propVal
  if (Object.keys(formDataEntries).length) return formDataEntries
  return false
}
