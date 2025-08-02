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
export type RouteHandler<P extends RouteParmas = RouteParmas> = (
  req: IncomingMessage,
  res: HttpResponse,
  ctx: RouteContext<P>,
) => void | Promise<void>

export type RouteParmas = Record<string, string>
export interface RouteContext<P extends RouteParmas = RouteParmas> {
  path: string
  params: P
  searchParams: URLSearchParams
}

export interface MatchedRoute<P extends RouteParmas = RouteParmas> {
  handler: RouteHandler<P>
  params: Record<string, string>
}
