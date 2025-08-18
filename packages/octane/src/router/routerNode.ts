import type { RouteHandler, RouteMiddleware } from './router.js'

export class RouterNode {
  paramName: string | null
  paramChild: RouterNode | null
  children: Map<string, RouterNode>
  handler: RouteHandler | null
  middleware: RouteMiddleware[]

  constructor() {
    this.paramName = null
    this.paramChild = null
    this.children = new Map()
    this.handler = null
    this.middleware = []
  }
}
