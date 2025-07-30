import type { URLSearchParams } from 'url'
import { IncomingMessage, ServerResponse as ServerResponse } from 'http'
import type { sendText, sendJson, sendNotFound, sendServerError, sendXml } from '../decorators/resultDecorators.js'

export interface HttpResponse extends ServerResponse {
  sendText: typeof sendText
  sendJson: typeof sendJson
  sendXml: typeof sendXml
  sendNotFound: typeof sendNotFound
  sendServerError: typeof sendServerError
}

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
export type RouteHandler = (req: IncomingMessage, res: HttpResponse, ctx: RouteContext) => void | Promise<void>

export interface RouteContext {
  path: string
  params: Record<string, string>
  searchParams: URLSearchParams
}

export interface MatchedRoute {
  handler: RouteHandler
  params: Record<string, string>
}
