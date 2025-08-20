import type { ServerResponse } from 'http'
import type { RouteMethod } from '../router/router.js'

type EndCB = () => void
type EndArgs = [cb?: EndCB] | [chunk: unknown, cb?: EndCB] | [chunk: unknown, enc: BufferEncoding, cb?: EndCB]

export interface HttpResponse extends ServerResponse {
  send: typeof send
  sendText: typeof sendText
  sendJson: typeof sendJson
  sendXml: typeof sendXml
  redirect: typeof redirect
  sendOptions: typeof sendOptions
  sendUnauthorized: typeof sendUnauthorized
  sendMethodNotAllowed: typeof sendMethodNotAllowed
  sendNotFound: typeof sendNotFound
  sendServerError: typeof sendServerError
}

function send(this: HttpResponse, status: number) {
  this.statusCode = status
  this.end()
}

function sendText(this: HttpResponse, status: number, data: string): void {
  this.writeHead(status, { 'Content-Type': 'text/plain' })
  this.end(data)
}

function sendJson(this: HttpResponse, status: number, data: unknown): void {
  this.writeHead(status, { 'Content-Type': 'application/json' })
  this.end(typeof data === 'string' ? data : JSON.stringify(data))
}

function sendXml(this: HttpResponse, status: number, data: string): void {
  this.writeHead(status, {
    'Content-Type': 'application/xml',
    'Content-Length': Buffer.byteLength(data),
  })
  this.end(data.trim())
}

function redirect(this: HttpResponse, url: string, permanent: boolean = true) {
  const status = permanent ? 301 : 302
  this.writeHead(status, { Location: url })
  this.end()
}

function sendOptions(this: HttpResponse, methods: RouteMethod[] | string) {
  this.writeHead(204, { Allow: Array.isArray(methods) ? methods.join(', ') : methods })
  this.end()
}

function sendUnauthorized(this: HttpResponse, msg: string) {
  this.writeHead(401, { 'Content-Type': 'text/plain' })
  this.end(msg)
}

function sendMethodNotAllowed(this: HttpResponse, methods: RouteMethod[]) {
  this.writeHead(405, { Allow: methods.join(', ') })
  this.end()
}

function sendNotFound(this: HttpResponse): void {
  this.writeHead(404, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: 'Not found' }))
}

function sendServerError(this: HttpResponse, msg = 'Internal Server Error'): void {
  this.writeHead(500, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: msg }))
}

export function toHttpResponse(res: ServerResponse, isHead = false): HttpResponse {
  const dres = res as HttpResponse
  dres.send = send
  dres.sendText = sendText
  dres.sendJson = sendJson
  dres.sendXml = sendXml
  dres.redirect = redirect
  dres.sendOptions = sendOptions
  dres.sendUnauthorized = sendUnauthorized
  dres.sendMethodNotAllowed = sendMethodNotAllowed
  dres.sendNotFound = sendNotFound
  dres.sendServerError = sendServerError

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
