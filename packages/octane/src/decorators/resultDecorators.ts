import type { HttpResponse } from '../types/index.js'

export function sendText(this: HttpResponse, status: number, data: string): void {
  this.writeHead(status, { 'Content-Type': 'text/plain' })
  this.end(data)
}

export function sendJson(this: HttpResponse, status: number, data: unknown): void {
  this.writeHead(status, { 'Content-Type': 'application/json' })
  this.end(typeof data === 'string' ? data : JSON.stringify(data))
}

export function sendXml(this: HttpResponse, status: number, data: string): void {
  this.writeHead(status, {
    'Content-Type': 'application/xml',
    'Content-Length': Buffer.byteLength(data),
  })
  this.end(data.trim())
}

export function redirect(this: HttpResponse, url: string, permanent: boolean = true) {
  const status = permanent ? 301 : 302
  this.writeHead(status, { Location: url })
}

export function sendUnathorized(this: HttpResponse, msg: string) {
  this.sendText(401, msg)
}

export function sendNotFound(this: HttpResponse): void {
  this.sendJson(404, { error: 'Not found' })
}

export function sendServerError(this: HttpResponse): void {
  this.sendJson(500, { error: 'Internal Server Error' })
}
