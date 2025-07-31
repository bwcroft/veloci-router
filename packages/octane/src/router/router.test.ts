import { before } from 'node:test'
import { Router } from './router.js'
import { RouteHandler } from '../types/index.js'

describe('Router', () => {
  let router: Router

  before(() => {
    router = new Router()
  })

  it('Should create GET and HEAD route', () => {
    const path = '/get'
    const handler: RouteHandler = (_, res) => res.sendJson(200, { path: 'get' })
    router.get(path, handler)
    const getRoute = router.match('GET', path)
    const headRoute = router.match('HEAD', path)

    expect(getRoute).toBeTruthy()
    expect(getRoute).toHaveProperty('params')
    expect(getRoute).toHaveProperty('handler')
    expect(getRoute?.handler).toEqual(handler)
    expect(headRoute).toBeTruthy()
  })
})
