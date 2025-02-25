import Url from 'node:url'
import {
  IRequestListenerHolder,
  RequestErrorEnum,
  RequestListener,
  RequestMethod,
  RouterListeners,
  ServerRequestClass,
  ServerResponseClass,
} from '../types/index.js'
import { RequestErrors } from './errors.js'

export class Router implements IRequestListenerHolder {
  private readonly _listeners: RouterListeners = {}
  private readonly _middlewares: RequestListener[] = []

  public get listeners(): RouterListeners {
    return this._listeners
  }

  public get middlewares(): RequestListener[] {
    return this._middlewares
  }

  public get routesWithParams(): string[] {
    return Object.keys(this._listeners).filter((route) => route.includes(':'))
  }

  private findListener(req: ServerRequestClass): RequestListener | null {
    const route = this.getRoute(req)

    let listener = this._listeners[route]?.[req.method]
    if (listener) return listener

    listener = this._listeners[req.originalRoute]?.[req.method]

    return listener ?? null
  }

  private async runListenerStack(
    req: ServerRequestClass,
    res: ServerResponseClass,
    stack: RequestListener[]
  ) {
    const listener = stack.shift()
    if (!listener) return

    const next: Parameters<RequestListener>['2'] = () => {
      this.runListenerStack(req, res, stack)
    }

    const listenResult = listener(req, res, next)

    if (listenResult instanceof Promise) {
      try {
        await listenResult
      } catch (error: any) {
        RequestErrors.throw(res, RequestErrorEnum.SERVER_ERROR, error?.message)
      }
    }
  }

  private getListenerStack(
    listener: RequestListener | null,
    _middlewares: RequestListener[] = this._middlewares
  ): RequestListener[] {
    const listenerStack = [..._middlewares]

    if (listener) listenerStack.push(listener)
    else
      listenerStack.push((req, res) => {
        RequestErrors.throw(res, RequestErrorEnum.NOT_FOUND)
      })

    return listenerStack
  }

  public async handle(req: ServerRequestClass, res: ServerResponseClass) {
    try {
      const listener = this.findListener(req)
      const listenerStack = this.getListenerStack(listener)
      this.runListenerStack(req, res, listenerStack)
    } catch (error: any) {
      RequestErrors.throw(res, RequestErrorEnum.SERVER_ERROR, error?.message)
    }
  }

  public get(path: string, listener: RequestListener) {
    this.addListener(path, RequestMethod.GET, listener)
  }

  public post(path: string, listener: RequestListener) {
    this.addListener(path, RequestMethod.POST, listener)
  }

  public delete(path: string, listener: RequestListener) {
    this.addListener(path, RequestMethod.DELETE, listener)
  }

  public put(path: string, listener: RequestListener) {
    this.addListener(path, RequestMethod.PUT, listener)
  }

  public patch(path: string, listener: RequestListener) {
    this.addListener(path, RequestMethod.PATCH, listener)
  }

  private combinePaths(path1: string, path2: string): string {
    if (path1.startsWith('/')) {
      if (path2.startsWith('/')) return `${path1}${path2}`
      else return `${path1}/${path2}`
    } else {
      if (path2.startsWith('/')) return `/${path1}${path2}`
      else return `/${path1}/${path2}`
    }
  }

  public addNestedRouter(path1: string, router: Router) {
    for (const [path2, listenersByMethod] of Object.entries(router.listeners))
      for (const [method, listener] of Object.entries(listenersByMethod)) {
        const path = this.combinePaths(path1, path2)

        const nestedListener: RequestListener = (req, res) => {
          const listenerStack = this.getListenerStack(
            listener,
            router.middlewares
          )
          this.runListenerStack(req, res, listenerStack)
        }

        switch (method as RequestMethod) {
          case RequestMethod.GET:
            this.get(path, nestedListener)
            break
          case RequestMethod.POST:
            this.post(path, nestedListener)
            break
          case RequestMethod.DELETE:
            this.delete(path, nestedListener)
            break
          case RequestMethod.PATCH:
            this.patch(path, nestedListener)
            break
          case RequestMethod.PUT:
            this.put(path, nestedListener)
            break
        }
      }
  }

  public use(middleware: RequestListener) {
    this._middlewares.push(middleware)
  }

  private addListener(
    path: string,
    method: RequestMethod,
    listener: RequestListener
  ) {
    if (!this._listeners[path]) this._listeners[path] = {}

    this._listeners[path][method] = listener
  }

  public getRoute(req: ServerRequestClass): string {
    if (!req.url) throw new Error()
    const pathname = Url.parse(req.url).pathname
    if (!pathname) throw new Error()
    return pathname
  }
}
