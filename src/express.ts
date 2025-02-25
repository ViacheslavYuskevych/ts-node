import http from 'node:http'
import { Middleware } from './core/middleware.js'
import {
  IRequestListenerHolder,
  RequestListener,
  ServerRequest,
  ServerResponse,
} from './types/index.js'
import { Router } from './core/router.js'

export class Express implements IRequestListenerHolder {
  private readonly _router: Router = new Router()
  private readonly _server: http.Server<ServerRequest, ServerResponse>

  constructor() {
    this._server = http.createServer((req, res) => {
      Middleware.use(req, res, { router: this._router })
      this._router.handle(req, res)
    })
  }

  public listen(
    port: number,
    handler?: () => void
  ): http.Server<ServerRequest, ServerResponse> {
    return this._server.listen(port, () => {
      handler?.()
    })
  }

  public use(middleware: RequestListener) {
    this._router.use(middleware)
  }

  /* router */

  public useRouter(path: string, router: Router) {
    this._router.addNestedRouter(path, router)
  }

  public get(path: string, listener: RequestListener) {
    this._router.get(path, listener)
  }

  public post(path: string, listener: RequestListener) {
    this._router.post(path, listener)
  }

  public delete(path: string, listener: RequestListener) {
    this._router.delete(path, listener)
  }

  public put(path: string, listener: RequestListener) {
    this._router.put(path, listener)
  }

  public patch(path: string, listener: RequestListener) {
    this._router.patch(path, listener)
  }
}
