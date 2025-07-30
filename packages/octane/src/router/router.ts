import http from 'http'
import { RouterNode } from './routerNode.js'
import { resToHttpResponse } from '../decorators/index.js'
import type { MatchedRoute, RouteContext, RouteHandler, RouteMethod } from '../types/index.js'

export class Router {
  private root: Map<string, RouterNode>

  constructor() {
    this.root = new Map()
  }

  #splitPath(path: string) {
    return path?.split('/').filter(Boolean)
  }

  #getUrlParamName(segment: string) {
    let paramName: string | undefined
    if (segment.startsWith(':')) {
      paramName = segment.slice(1)
    }
    return paramName
  }

  #add(method: RouteMethod, path: string, handler: RouteHandler) {
    if (!this.root.has(method)) {
      this.root.set(method, new RouterNode())
    }

    const segments = this.#splitPath(path)
    let node = this.root.get(method)

    for (const segment of segments) {
      const paramName = this.#getUrlParamName(segment)
      if (paramName && node) {
        if (node?.paramName && node.paramName !== paramName) {
          throw new Error(
            `Route conflict: "${path}" has conflicting parameter "${segment}" to another paths parameter "${node.paramName}"`,
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
    }
  }

  #match(method: RouteMethod, path: string): MatchedRoute | null {
    try {
      const segments = this.#splitPath(path)
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
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  #createServer() {
    return http.createServer(async (req, r) => {
      const res = resToHttpResponse(r, req.method === 'HEAD')

      try {
        if (!req.url || typeof req.method !== 'string') {
          res.sendNotFound()
          return
        }

        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`)
        const route = this.#match(req.method as RouteMethod, pathname)

        if (route) {
          await route.handler(req, res, {
            path: pathname,
            params: route.params,
            searchParams,
          })
        } else {
          res.sendNotFound()
        }
      } catch (err) {
        console.error('Handler error:', err)
        res.sendServerError()
      }
    })
  }

  get(path: string, handler: RouteHandler) {
    this.#add('GET', path, handler)
    this.head(path, handler)
  }

  post(path: string, handler: RouteHandler) {
    this.#add('POST', path, handler)
  }

  put(path: string, handler: RouteHandler) {
    this.#add('PUT', path, handler)
  }

  patch(path: string, handler: RouteHandler) {
    this.#add('PATCH', path, handler)
  }

  delete(path: string, handler: RouteHandler) {
    this.#add('DELETE', path, handler)
  }

  head(path: string, handler: RouteHandler) {
    this.#add('HEAD', path, handler)
  }

  options(path: string, handler: RouteHandler) {
    this.#add('OPTIONS', path, handler)
  }

  listen(port: string, listener?: () => void) {
    this.#createServer().listen(port, listener)
  }
}
