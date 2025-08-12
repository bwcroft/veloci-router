import { ServerResponse } from 'http'
import { HttpResponse } from '../types/index.js'
import { sendText, sendJson, sendNotFound, sendServerError, sendUnathorized, redirect } from './resultDecorators.js'

type EndCB = () => void
type EndArgs = [cb?: EndCB] | [chunk: unknown, cb?: EndCB] | [chunk: unknown, enc: BufferEncoding, cb?: EndCB]

export function resToHttpResponse(res: ServerResponse, headReq = false): HttpResponse {
  const dres = res as HttpResponse
  dres.sendText = sendText
  dres.sendJson = sendJson
  dres.redirect = redirect
  dres.sendUnauthorized = sendUnathorized
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
  if (headReq) {
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
