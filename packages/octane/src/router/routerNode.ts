import { RouteMethod } from './router.js'
import type { RouteHandler, RouteMiddleware } from './router.js'

export type RouteNodeParamName = string | null
export type RouteNodeParamChild = RouterNode | null
export type RouteNodeChildren = Map<string, RouterNode>
export type RouteNodeHandlers = Map<RouteMethod, (RouteMiddleware | RouteHandler)[]>

export interface RouterNodeInit {
  paramName?: RouteNodeParamName
  paramChild?: RouteNodeParamChild
  children?: RouteNodeChildren
  handlers?: RouteNodeHandlers
}

export class RouterNode {
  handlers: RouteNodeHandlers
  paramName: RouteNodeParamName
  paramChild: RouteNodeParamChild
  children: RouteNodeChildren

  constructor(src?: RouterNodeInit) {
    this.paramName = src?.paramName || null
    this.paramChild = src?.paramChild || null
    this.children = src?.children || new Map()
    this.handlers = src?.handlers || new Map()
  }

  getHandlers(method: RouteMethod): (RouteMiddleware | RouteHandler)[] | undefined {
    let handlers = this.handlers.get(method)
    if (!handlers && method === 'HEAD') {
      handlers = this.handlers.get('GET')
    }
    return handlers
  }

  getOptions(): RouteMethod[] {
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

  get isSplat(): boolean {
    return this.paramName === '*'
  }
}
