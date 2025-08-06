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
export type RouteHandler<P extends string = string, T extends object = object> = (
  req: IncomingMessage,
  res: HttpResponse,
  ctx: RouteContext<P, T>,
) => void | Promise<void>

export type RouteParmas = Record<string, string>
export type RouteContext<P extends string = string, T extends object = object> = {
  path: string
  params: { [K in P]?: string }
  searchParams: URLSearchParams
} & T

export interface MatchedRoute<P extends string = string> {
  handler: RouteHandler<P>
  params: { [K in P]?: string }
}
