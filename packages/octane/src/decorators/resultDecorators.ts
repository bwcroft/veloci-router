import { ServerResponse } from 'http'

type SendJsonData = string | Record<string | number | symbol, unknown> | unknown[]

export function sendText(this: ServerResponse, status: number, data: string) {
  this.writeHead(status, { 'Content-Type': 'text/plain' })
  this.end(data)
}

export function sendJson(this: ServerResponse, status: number, data: SendJsonData) {
  this.writeHead(status, { 'Content-Type': 'application/json' })
  this.end(typeof data === 'string' ? data : JSON.stringify(data))
}

export function sendNotFound(this: ServerResponse) {
  this.writeHead(404, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: 'Not found' }))
}

export function sendServerError(this: ServerResponse) {
  this.writeHead(500, { 'Content-Type': 'application/json' })
  this.end(JSON.stringify({ error: 'Internal Server Error' }))
}
