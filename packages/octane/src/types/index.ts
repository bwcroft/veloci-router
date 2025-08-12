import type { URLSearchParams } from 'url'
import type { IncomingMessage, ServerResponse as ServerResponse } from 'http'
import type {
  sendText,
  sendJson,
  sendNotFound,
  sendServerError,
  sendXml,
  sendUnathorized,
  redirect,
} from '../decorators/resultDecorators.js'

export interface HttpResponse extends ServerResponse {
  sendText: typeof sendText
  sendJson: typeof sendJson
  sendXml: typeof sendXml
  redirect: typeof redirect
  sendUnauthorized: typeof sendUnathorized
  sendNotFound: typeof sendNotFound
  sendServerError: typeof sendServerError
}

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export type RouteHandler<P extends string = string, T extends object = object> = (
  req: IncomingMessage,
  res: HttpResponse,
  ctx: RouteContext<P, T>,
) => void | Promise<void>

export type NextHandler = (err?: string | Error | null) => void | Promise<void>
export type RouteMiddleware<P extends string = string, T extends object = object> = (
  req: IncomingMessage,
  res: HttpResponse,
  ctx: RouteContext<P, T>,
  next: NextHandler,
) => void | Promise<void>

export interface RouteConfig {
  middleware?: RouteMiddleware[]
}

export type RouteParmas = Record<string, string>
export type RouteContext<P extends string = string, T extends object = object> = {
  path: string
  params: { [K in P]?: string }
  searchParams: URLSearchParams
} & Partial<T>

export interface MatchedRoute<P extends string = string> {
  handler: RouteHandler<P>
  middleware: RouteMiddleware<P>[]
  params: { [K in P]?: string }
}
