import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { Router, RouteConfig, RouteHandler, RouteMethod, RouteMiddleware } from './router.js'
import { allowedBodyMethods } from '../decorators/requestDecorators.js'

type Server = ReturnType<Router['createServer']>

interface RouteNode {
  path: string
  code: number
  method: Lowercase<RouteMethod>
  handler: RouteHandler
  testPath: string
  testKey: 'body' | 'text'
  testVal: string | object
  config?: RouteConfig
}

interface RouteGroupNode {
  path: string
  routes: RouteNode[]
  groups?: RouteGroupNode[]
  middleware?: RouteMiddleware[]
}

interface RouteMap {
  routes: RouteNode[]
  groups: RouteGroupNode[]
}

const routeMap: RouteMap = {
  routes: [
    {
      path: '/',
      method: 'get',
      code: 200,
      testPath: '/',
      testKey: 'text',
      testVal: 'root',
      handler: (req, res) => {
        res.sendText(200, 'root')
      },
    },
    {
      path: '/get',
      method: 'get',
      code: 200,
      testPath: '/get',
      testKey: 'body',
      testVal: { method: 'get' },
      handler: (req, res) => {
        res.sendJson(200, { method: 'get' })
      },
    },
    {
      path: '/head',
      method: 'head',
      code: 200,
      testPath: '/head',
      testKey: 'body',
      testVal: {},
      handler: (req, res) => {
        res.sendJson(200, { method: 'head' })
      },
    },
    {
      path: '/post',
      method: 'post',
      code: 201,
      testPath: '/post',
      testKey: 'body',
      testVal: { method: 'post' },
      handler: (req, res) => {
        res.sendJson(201, { method: 'post' })
      },
    },
    {
      path: '/put',
      method: 'put',
      code: 200,
      testPath: '/put',
      testKey: 'body',
      testVal: { method: 'put' },
      handler: (req, res) => {
        res.sendJson(200, { method: 'put' })
      },
    },
    {
      path: '/patch',
      method: 'patch',
      code: 200,
      testPath: '/patch',
      testKey: 'body',
      testVal: { method: 'patch' },
      handler: (req, res) => {
        res.sendJson(200, { method: 'patch' })
      },
    },
    {
      path: '/delete',
      method: 'delete',
      code: 200,
      testPath: '/delete',
      testKey: 'body',
      testVal: { method: 'delete' },
      handler: (req, res) => {
        res.sendJson(200, { method: 'delete' })
      },
    },
  ],
  groups: [
    {
      path: '/users',
      routes: [
        {
          path: '/',
          method: 'get',
          code: 200,
          testPath: '/users',
          testKey: 'body',
          testVal: { first: 'bob', last: 'johnson' },
          handler: (req, res) => {
            res.sendJson(200, { first: 'bob', last: 'johnson' })
          },
        },
        {
          path: '/',
          method: 'post',
          code: 201,
          testPath: '/users',
          testKey: 'body',
          testVal: { first: 'bob', last: 'johnson' },
          handler: (req, res) => {
            res.sendJson(201, req.body)
          },
        },
      ],
      groups: [
        {
          path: '/:id',
          routes: [
            {
              path: '/',
              method: 'get',
              code: 200,
              testPath: '/users/32',
              testKey: 'body',
              testVal: { id: 32, first: 'billy', last: 'bob' },
              handler: (req, res, ctx) => {
                const id = Number(ctx.params?.id)
                if (typeof id === 'number') {
                  res.sendJson(200, { id, first: 'billy', last: 'bob' })
                } else {
                  res.sendServerError()
                }
              },
            },
            {
              path: '/',
              method: 'put',
              code: 200,
              testPath: '/users/12',
              testKey: 'body',
              testVal: { id: 12, first: 'sam', last: 'bob' },
              handler: (req, res, ctx) => {
                const id = Number(ctx.params?.id)
                const data = typeof req.body === 'object' ? req.body : {}
                if (typeof id === 'number') {
                  res.sendJson(200, { ...data, id })
                } else {
                  res.sendServerError()
                }
              },
            },
            {
              path: '/',
              method: 'patch',
              code: 200,
              testPath: '/users/3948',
              testKey: 'body',
              testVal: { id: 3948, first: 'sam', last: 'bob' },
              handler: (req, res, ctx) => {
                const id = Number(ctx.params?.id)
                const data = typeof req.body === 'object' ? req.body : {}
                if (typeof id === 'number') {
                  res.sendJson(200, { ...data, id })
                } else {
                  res.sendServerError()
                }
              },
            },
            {
              path: '/',
              method: 'delete',
              code: 200,
              testPath: '/users/204921',
              testKey: 'text',
              testVal: '',
              handler: (req, res) => {
                res.send(200)
              },
            },
          ],
        },
      ],
    },
  ],
}

function makeRoutes(router: Router, routes: RouteNode[]) {
  for (const route of routes) {
    router[route.method](route.path, route.handler, route.config)
  }
}

function makeRouteGroup(router: Router, groups: RouteGroupNode[]) {
  for (const group of groups) {
    router.group(group.path, group.middleware || [], (rgr) => {
      makeRoutes(rgr, group.routes)
      makeRouteGroup(rgr, group.groups || [])
    })
  }
}

function makeRouter({ routes, groups }: RouteMap): Router {
  const router = new Router()
  makeRoutes(router, routes)
  makeRouteGroup(router, groups)
  return router
}

function testRoutes(server: Server, routes: RouteNode[]) {
  for (const route of routes) {
    it(`Route(${route.method}): ${route.testPath})`, async () => {
      if (route.method === 'get') {
        const [getRes, headRes] = await Promise.all([
          request(server).get(route.testPath),
          request(server).head(route.testPath),
        ])
        expect(getRes.status).toBe(route.code)
        expect(getRes[route.testKey]).toEqual(route.testVal)
        expect(headRes.status).toBe(route.code)
        expect(headRes[route.testKey] || {}).toEqual({})
      } else if (route.method === 'head') {
        const res = await request(server).head(route.testPath)
        expect(res.status).toBe(route.code)
        expect(res[route.testKey]).toEqual(route.testVal)
      } else if (allowedBodyMethods.has(route.method.toUpperCase())) {
        const res = await request(server)[route.method](route.testPath).send(route.testVal)
        expect(res.status).toBe(route.code)
        expect(res[route.testKey]).toEqual(route.testVal)
      } else {
        throw new Error(`Route Method (${route.method}): does not have a test case!`)
      }
    })
  }
}

function testGroups(server: Server, groups: RouteGroupNode[]) {
  for (const group of groups) {
    testRoutes(server, group.routes)
    testGroups(server, group?.groups || [])
  }
}

describe('Router', () => {
  const router = makeRouter(routeMap)
  const server = router.createServer()

  it('404 Not Found', async () => {
    const res = await request(server).get('/not-found')
    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })

  describe('Individual Routes', () => {
    testRoutes(server, routeMap.routes)
  })

  describe('Grouped Routes', () => {
    testGroups(server, routeMap.groups)
  })
})
