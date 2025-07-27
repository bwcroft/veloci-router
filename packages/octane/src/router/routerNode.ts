import { RouteHandler } from '../types/index.js'

export class RouterNode {
  children: Map<string, RouterNode>
  handler: RouteHandler | null
  paramName: string | null
  paramChild: RouterNode | null

  constructor() {
    this.paramName = null
    this.paramChild = null
    this.children = new Map()
    this.handler = null
  }
}
