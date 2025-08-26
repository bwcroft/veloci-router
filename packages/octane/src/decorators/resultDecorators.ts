import { type ServerResponse } from 'http'
import type { RouteMethod } from '../router/router.js'

type EndCB = () => void
type EndArgs = [cb?: EndCB] | [chunk: unknown, cb?: EndCB] | [chunk: unknown, enc: BufferEncoding, cb?: EndCB]

export interface HttpResponse extends ServerResponse {
  code: typeof code
  type: typeof type
  send: typeof send
  redirect: typeof redirect
  options: typeof options
  unauthorized: typeof unauthorized
  methodNotAllowed: typeof methodNotAllowed
  notFound: typeof notFound
  serverError: typeof serverError
}

function code(this: HttpResponse, status: number): HttpResponse {
  this.statusCode = status
  return this
}

function type(this: HttpResponse, contentType: string): HttpResponse {
  this.setHeader('Content-Type', contentType)
  return this
}

function send(this: HttpResponse, body?: unknown) {
  if (body === undefined || body === null || this.getHeader('Content-Type')) {
    this.end(body)
  } else if (typeof body === 'string') {
    this.setHeader('Content-Type', 'text/plain; charset=utf-8')
    this.end(body)
  } else if (Buffer.isBuffer(body)) {
    this.setHeader('Content-Type', 'application/octet-stream')
    this.end(body)
  } else if (typeof body === 'object') {
    this.setHeader('Content-Type', 'application/json; charset=utf-8')
    this.end(JSON.stringify(body))
  } else {
    this.setHeader('Content-Type', 'text/plain; charset=utf-8')
    this.end(String(body))
  }
}

function redirect(this: HttpResponse, url: string, permanent: boolean = true) {
  const status = permanent ? 301 : 302
  this.writeHead(status, { Location: url })
  this.end()
}

function options(this: HttpResponse, methods: RouteMethod[] | string) {
  this.writeHead(204, { Allow: Array.isArray(methods) ? methods.join(', ') : methods })
  this.end()
}

function unauthorized(this: HttpResponse, msg: string = 'unauthorized') {
  this.writeHead(401, { 'Content-Type': 'text/plain' })
  this.end(msg)
}

function methodNotAllowed(this: HttpResponse, methods: RouteMethod[]) {
  this.writeHead(405, { Allow: methods.join(', ') })
  this.end()
}

function notFound(this: HttpResponse): void {
  this.writeHead(404, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: 'Not found' }))
}

function serverError(this: HttpResponse, msg = 'Internal Server Error'): void {
  this.writeHead(500, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: msg }))
}

export function toHttpResponse(res: ServerResponse, isHead = false): HttpResponse {
  const dres = res as HttpResponse
  dres.code = code
  dres.type = type
  dres.send = send
  dres.redirect = redirect
  dres.options = options
  dres.unauthorized = unauthorized
  dres.methodNotAllowed = methodNotAllowed
  dres.notFound = notFound
  dres.serverError = serverError

  /**
   * Overrides the `write` and `end` methods on the response object for HEAD requests.
   *
   * For HEAD requests, no response body should be sent. These overrides ensure that any
   * calls to `res.write` or `res.end(chunk)` do not send a body, while still preserving
   * headers and status codes.
   *
   * The `end` method also maintains support for Node's overloaded signatures, normalizing
   * callback and encoding handling.
   */
  if (isHead) {
    const originalEnd = res.end
    dres.write = () => true
    dres.end = function end(this: HttpResponse, ...args: EndArgs) {
      let cb: (() => void) | undefined
      let encoding: BufferEncoding = 'utf8'

      if (typeof args[0] === 'function') {
        cb = args[0] as () => void
      } else if (typeof args[1] === 'function') {
        cb = args[1] as () => void
      } else if (typeof args[1] === 'string' && typeof args[2] === 'function') {
        cb = args[2] as () => void
        encoding = args[1]
      }

      return originalEnd.call(this, undefined, encoding, cb) as HttpResponse
    }
  }

  return dres
}
