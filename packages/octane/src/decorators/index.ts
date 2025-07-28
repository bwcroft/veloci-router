import { ServerResponse } from 'http'
import { HttpReponse } from '../types/index.js'
import { sendText, sendJson, sendNotFound, sendServerError } from './resultDecorators.js'

export function resToHttpReponse(res: ServerResponse): HttpReponse {
  const dres = res as HttpReponse
  dres.sendText = sendText
  dres.sendJson = sendJson
  dres.sendNotFound = sendNotFound
  dres.sendServerError = sendServerError
  return dres
}
