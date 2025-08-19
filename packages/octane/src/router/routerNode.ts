import { RouteMethod } from '../types.js'
import type { RouteHandler, RouteMiddleware } from './router.js'

export class RouterNode {
  paramName: string | null
  paramChild: RouterNode | null
  children: Map<string, RouterNode>
  handlers: Map<RouteMethod, (RouteMiddleware | RouteHandler)[]> | null

  constructor() {
    this.paramName = null
    this.paramChild = null
    this.children = new Map()
    this.handlers = null
  }
}
