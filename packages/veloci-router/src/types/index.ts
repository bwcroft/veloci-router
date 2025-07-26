import { URLSearchParams } from 'url'
import { IncomingMessage, ServerResponse } from 'http'

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => void | Promise<void>

export interface RouteContext {
  path: string
  params: Record<string, string>
  searchParams: URLSearchParams
}

export interface MatchedRoute {
  handler: RouteHandler
  params: Record<string, string>
}
