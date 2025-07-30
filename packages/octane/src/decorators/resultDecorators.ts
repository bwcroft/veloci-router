import type { HttpResponse } from '../types/index.js'

type SendJsonData = string | Record<string | number | symbol, unknown> | unknown[]

export function sendText(this: HttpResponse, status: number, data: string): void {
  this.writeHead(status, { 'Content-Type': 'text/plain' })
  this.end(data)
}

export function sendJson(this: HttpResponse, status: number, data: SendJsonData): void {
  this.writeHead(status, { 'Content-Type': 'application/json' })
  this.end(typeof data === 'string' ? data : JSON.stringify(data))
}

export function sendXml(this: HttpResponse, status: number, data: string): void {
  this.writeHead(200, {
    'Content-Type': 'application/xml',
    'Content-Length': Buffer.byteLength(data),
  })
  this.end(data.trim())
}

export function sendNotFound(this: HttpResponse): void {
  this.sendJson(404, { error: 'Not found' })
}

export function sendServerError(this: HttpResponse): void {
  this.sendJson(500, { error: 'Internal Server Error' })
}
