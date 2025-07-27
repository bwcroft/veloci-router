import http, { ServerResponse } from 'http'
import { RouterNode } from './routerNode.js'
import { MatchedRoute, RouteContext, RouteHandler, RouteMethod } from '../types/index.js'

export class Router {
  private root: Map<string, RouterNode>

  constructor() {
    this.root = new Map()
  }

  private _splitPath(path: string) {
    return path?.split('/').filter(Boolean)
  }

  private _getUrlParamName(segment: string) {
    let paramName: string | undefined
    if (segment.startsWith(':')) {
      paramName = segment.slice(1)
    }
    return paramName
  }

  private _add(method: RouteMethod, path: string, handler: RouteHandler) {
    if (!this.root.has(method)) {
      this.root.set(method, new RouterNode())
    }

    const segments = this._splitPath(path)
    let node = this.root.get(method)

    for (const segment of segments) {
      const paramName = this._getUrlParamName(segment)
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

  private _match(method: RouteMethod, path: string): MatchedRoute | null {
    try {
      const segments = this._splitPath(path)
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

  private _createServer() {
    return http.createServer(async (req, res) => {
      if (!req.url || typeof req.method !== 'string') {
        this.sendNotFound(res)
        return
      }

      try {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`)
        const route = this._match(req.method as RouteMethod, pathname)
        if (route) {
          await route.handler(req, res, {
            path: pathname,
            params: route.params,
            searchParams,
          })
        } else {
          this.sendNotFound(res)
        }
      } catch (err) {
        console.error('Handler error:', err)
        this.sendError(res)
      }
    })
  }

  get(path: string, handler: RouteHandler) {
    this._add('GET', path, handler)
  }

  post(path: string, handler: RouteHandler) {
    this._add('POST', path, handler)
  }

  put(path: string, handler: RouteHandler) {
    this._add('PUT', path, handler)
  }

  patch(path: string, handler: RouteHandler) {
    this._add('PATCH', path, handler)
  }

  delete(path: string, handler: RouteHandler) {
    this._add('DELETE', path, handler)
  }

  sendNotFound(res: ServerResponse) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }

  sendError(res: http.ServerResponse) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal Server Error' }))
  }

  listen(port: string, callback: () => void) {
    this._createServer().listen(port, callback)
  }
}
