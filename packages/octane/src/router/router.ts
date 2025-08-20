import http from 'http'
import { RouterNode } from './routerNode.js'
import { toHttpRequest, HttpRequest } from '../decorators/requestDecorators.js'
import { toHttpResponse, HttpResponse } from '../decorators/resultDecorators.js'

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
export type RouterPrefix = string

export interface InitRouter {
  root?: RouterNode
  prefix?: RouterPrefix
  middleware?: RouteMiddleware[]
}

export type RouteHandler<P extends string = string, T extends object = object, B = unknown> = (
  req: HttpRequest<B>,
  res: HttpResponse,
  ctx: RouteContext<P, T>,
) => void | Promise<void>

export type NextHandler = (err?: string | Error | null) => void | Promise<void>
export type RouteMiddleware<P extends string = string, T extends object = object, B = unknown> = (
  req: HttpRequest<B>,
  res: HttpResponse,
  ctx: RouteContext<P, T>,
  next: NextHandler,
) => void | Promise<void>

export interface RouteConfig {
  middleware?: RouteMiddleware[]
}

export type RouteParmas = Record<string, string>
export type RouteContext<P extends string = string, T extends object = object> = {
  path: string
  params: { [K in P]?: string }
  searchParams: URLSearchParams
} & Partial<T>

type RegisterRoute = (path: string, handler: RouteHandler, config?: RouteConfig) => void

export class Router {
  root: RouterNode
  prefix: RouterPrefix
  middleware: RouteMiddleware[]

  constructor(src?: InitRouter) {
    this.root = src?.root || new RouterNode()
    this.prefix = src?.prefix || ''
    this.middleware = src?.middleware || []
  }

  private splitPath(path: string) {
    return path?.split('/').filter(Boolean)
  }

  private getUrlParamName(segment: string) {
    let paramName: string | undefined
    if (segment.startsWith(':')) {
      paramName = segment.slice(1)
    }
    return paramName
  }

  private add(method: RouteMethod, path: string, handler: RouteHandler, middleware: RouteMiddleware[] = []) {
    const fullPath = this.prefix ? `${this.prefix}${path}` : path
    const segments = this.splitPath(fullPath)
    let node: RouterNode | undefined = this.root

    for (const segment of segments) {
      const paramName = this.getUrlParamName(segment)
      if (paramName && node) {
        if (node?.paramName && node.paramName !== paramName) {
          throw new Error(
            `Route conflict: "${fullPath}" has conflicting parameter "${segment}" to another paths parameter "${node.paramName}"`,
          )
        } else if (!node.paramName || !node.paramChild) {
          node.paramName = segment.slice(1)
          node.paramChild = new RouterNode()
        }
        node = node.paramChild
      } else {
        if (!node?.children.has(segment)) {
          node?.children.set(segment, new RouterNode())
        }
        node = node?.children.get(segment)
      }
    }

    if (!node) return
    node.handlers.set(method, [...this.middleware, ...middleware, handler])
  }

  match(path: string) {
    try {
      const segments = this.splitPath(path)
      const params: RouteContext['params'] = {}
      let node: RouterNode | undefined = this.root

      if (node) {
        for (const segment of segments) {
          const segnode: RouterNode | undefined = node?.children.get(segment)
          if (segnode) {
            node = segnode
          } else if (node?.paramName && node.paramChild) {
            params[node.paramName] = segment
            node = node.paramChild
          } else {
            node = undefined
            break
          }
        }
      }

      if (!node || !node.handlers.size) {
        return null
      }

      return {
        node,
        params,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  private async execute(req: HttpRequest, res: HttpResponse, ctx: RouteContext, m: (RouteMiddleware | RouteHandler)[]) {
    let i = 0
    const next: NextHandler = async (err) => {
      if (res.writableEnded) return

      if (err) {
        console.error(err)
        res.sendServerError()
        return
      }

      if (i >= m.length) return
      const exec = m[i++]
      try {
        await exec(req, res, ctx, next)
      } catch (e) {
        await next(e as Error)
      }
    }
    await next()
  }

  createServer() {
    return http.createServer(async (rq, rs) => {
      const method = rq.method as RouteMethod
      const req = toHttpRequest(rq)
      const res = toHttpResponse(rs, method === 'HEAD')

      try {
        if (!req.url || typeof req.method !== 'string') {
          res.sendNotFound()
          return
        }

        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`)
        const { node, params } = this.match(pathname) || {}
        const hasHandlers = !!node?.handlers.size
        const handlers = node?.getHandlers(method)

        if (node && handlers) {
          const ctx = {
            path: pathname,
            params: params || {},
            searchParams,
          }
          await req.parseBody()
          await this.execute(req, res, ctx, handlers)
        } else if (method === 'OPTIONS' && hasHandlers) {
          res.sendOptions(node.getOptions())
        } else if (node?.handlers?.size) {
          res.sendMethodNotAllowed(node.getOptions())
        } else {
          res.sendNotFound()
        }
      } catch (err) {
        console.error('Handler error:', err)
        res.sendServerError()
      }
    })
  }

  group(prefix: string, cb: (router: Router) => void): void
  group(prefix: string, mw: RouteMiddleware[], cb: (router: Router) => void): void
  group(prefix: string, arg0: RouteMiddleware[] | ((router: Router) => void), arg1?: (router: Router) => void) {
    let cb: (router: Router) => void | undefined
    let mw: RouteMiddleware[] = []

    if (Array.isArray(arg0)) {
      mw = arg0
      cb = arg1!
    } else {
      cb = arg0
    }

    const router = new Router({
      root: this.root,
      middleware: [...this.middleware, ...mw],
      prefix: this.prefix ? `${this.prefix}${prefix}` : prefix,
    })
    cb(router)
    this.root = router.root
  }

  get: RegisterRoute = (path, handler, config) => {
    this.add('GET', path, handler, config?.middleware)
  }

  post: RegisterRoute = (path, handler, config) => {
    this.add('POST', path, handler, config?.middleware)
  }

  put: RegisterRoute = (path, handler, config) => {
    this.add('PUT', path, handler, config?.middleware)
  }

  patch: RegisterRoute = (path, handler, config) => {
    this.add('PATCH', path, handler, config?.middleware)
  }

  delete: RegisterRoute = (path, handler, config) => {
    this.add('DELETE', path, handler, config?.middleware)
  }

  head: RegisterRoute = (path, handler, config) => {
    this.add('HEAD', path, handler, config?.middleware)
  }

  options: RegisterRoute = (path, handler, config) => {
    this.add('OPTIONS', path, handler, config?.middleware)
  }

  listen(port: string, listener?: () => void) {
    this.createServer().listen(port, listener)
  }
}
