import http, { IncomingMessage } from 'http'
import { RouterNode } from './routerNode.js'
import { resToHttpResponse } from '../decorators/index.js'

import type {
  HttpResponse,
  MatchedRoute,
  NextHandler,
  RouteConfig,
  RouteContext,
  RouteGroupConfig,
  RouteHandler,
  RouteMethod,
  RouteMiddleware,
} from '../types/index.js'

export type RouterPrefix = string
export type RouterRoot = Map<string, RouterNode>

export interface InitRouter {
  root?: RouterRoot
  prefix?: RouterPrefix
  middleware?: RouteMiddleware[]
}

type RegisterRoute = (path: string, handler: RouteHandler, config?: RouteConfig) => void

export class Router {
  root: RouterRoot
  prefix: RouterPrefix
  middleware: RouteMiddleware[]

  constructor(src?: InitRouter) {
    this.root = src?.root || new Map()
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

  private add(method: RouteMethod, path: string, handler: RouteHandler, middleware?: RouteMiddleware[]) {
    if (!this.root.has(method)) {
      this.root.set(method, new RouterNode())
    }

    const fullPath = this.prefix ? `${this.prefix}${path}` : path
    const segments = this.splitPath(fullPath)
    let node = this.root.get(method)

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

    if (node) {
      node.handler = handler
      node.middleware = middleware ? [...this.middleware, ...middleware] : this.middleware
    }
  }

  match(method: RouteMethod, path: string): MatchedRoute | null {
    try {
      const segments = this.splitPath(path)
      const params: RouteContext['params'] = {}
      let node = this.root.get(method)

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

      if (!node || !node.handler) return null
      return {
        params,
        handler: node.handler,
        middleware: node.middleware,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  private async runMiddleware(req: IncomingMessage, res: HttpResponse, ctx: RouteContext, m: RouteMiddleware[]) {
    let i = 0
    const next: NextHandler = async (err) => {
      if (err) {
        console.error(err)
        res.sendServerError()
      }
      if (i >= m.length) return
      const exec = m[i++]
      await exec(req, res, ctx, next)
    }
    next()
  }

  private createServer() {
    return http.createServer(async (req, r) => {
      const res = resToHttpResponse(r, req.method === 'HEAD')

      try {
        if (!req.url || typeof req.method !== 'string') {
          res.sendNotFound()
          return
        }

        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`)
        const route = this.match(req.method as RouteMethod, pathname)

        if (route) {
          const ctx = {
            path: pathname,
            params: route.params,
            searchParams,
          }
          await this.runMiddleware(req, res, ctx, route.middleware)
          await route.handler(req, res, ctx)
        } else {
          res.sendNotFound()
        }
      } catch (err) {
        console.error('Handler error:', err)
        res.sendServerError()
      }
    })
  }

  group(prefix: string, init: (router: Router) => void, mw: RouteMiddleware[] = []) {
    const router = new Router({
      root: this.root,
      middleware: [...this.middleware, ...mw],
      prefix: this.prefix ? `${this.prefix}${prefix}` : prefix,
    })
    init(router)
    this.root = router.root
  }

  get: RegisterRoute = (path, handler, config) => {
    this.add('GET', path, handler, config?.middleware)
    this.head(path, handler)
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
