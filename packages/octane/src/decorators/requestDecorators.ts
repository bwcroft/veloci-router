import { IncomingMessage } from 'http'
import querystring from 'node:querystring'

export interface HttpRequest<B = unknown> extends IncomingMessage {
  parseBody: typeof parseBody
  body: B
}

export interface ParseBodyParams {
  limit?: number
}

export const allowedBodyMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

async function parseBody(this: HttpRequest, opts?: ParseBodyParams): Promise<unknown> {
  if (!this?.method || !allowedBodyMethods.has(this.method)) {
    return null
  }

  const limit = opts?.limit || 1e6
  const type = (this.headers['content-type'] || '').split(';')[0].trim()
  let body = ''
  let size = 0

  for await (const chunk of this) {
    size += chunk.length
    if (size > limit) {
      throw new Error('Body too large')
    }
    body += chunk.toString('utf-8')
  }

  switch (type) {
    case 'application/json':
      this.body = JSON.parse(body)
      break
    case 'application/x-www-form-urlencoded':
      this.body = querystring.parse(body)
      break
    case 'text/plain':
      this.body = body
      break
    default:
      this.body = body
  }
}

export function toHttpRequest(req: IncomingMessage) {
  const dreq = req as HttpRequest
  dreq.parseBody = parseBody
  return dreq
}
