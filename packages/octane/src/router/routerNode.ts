import { RouteMethod } from './router.js'
import type { RouteHandler, RouteMiddleware } from './router.js'

export class RouterNode {
  paramName: string | null
  paramChild: RouterNode | null
  children: Map<string, RouterNode>
  handlers: Map<RouteMethod, (RouteMiddleware | RouteHandler)[]>

  constructor() {
    this.paramName = null
    this.paramChild = null
    this.children = new Map()
    this.handlers = new Map()
  }

  getHandlers(method: RouteMethod) {
    let handlers = this.handlers.get(method)
    if (!handlers && method === 'HEAD') {
      handlers = this.handlers.get('GET')
    }
    return handlers
  }

  getOptions() {
    const result: RouteMethod[] = []
    let hasGet = false
    let hasHead = false
    let hasOptions = false

    for (const k of this.handlers.keys()) {
      result.push(k)
      if (k === 'GET') hasGet = true
      if (k === 'HEAD') hasHead = true
      if (k === 'OPTIONS') hasOptions = true
    }

    if (hasGet && !hasHead) {
      result.push('HEAD')
    }

    if (!hasOptions) {
      result.push('OPTIONS')
    }

    return result
  }
}
