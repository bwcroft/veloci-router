import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { allowedBodyMethods } from '../decorators/requestDecorators.js'
import { Router, RouteMethod, RouteConfig, RouteHandler, RouteMiddleware, RouteContext } from './router.js'

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

type RootMiddlwareCtx = { root: true }
const rootMiddlware: RouteMiddleware<string, RootMiddlwareCtx> = (req, res, ctx, next) => {
  ctx.root = true
  next()
}

type AuthMiddlewareCtx = { authorized: boolean }
const authMiddleware: RouteMiddleware<string, AuthMiddlewareCtx> = (req, res, ctx, next) => {
  if (ctx.searchParams.get('trustme') !== 'true') {
    res.sendUnauthorized('Unauthorized')
  } else {
    ctx.authorized = true
  }
  next()
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
    {
      path: '/redirect',
      method: 'get',
      code: 301,
      testPath: '/redirect',
      testKey: 'text',
      testVal: '',
      handler: (req, res) => {
        res.redirect('/redirected')
      },
    },
    {
      path: '/unauthorized',
      method: 'get',
      code: 401,
      testPath: '/unauthorized',
      testKey: 'text',
      testVal: 'Unauthorized',
      handler: (_, res) => {
        res.send(300)
      },
      config: {
        middleware: [authMiddleware],
      },
    },
    {
      path: '/authorized',
      method: 'get',
      code: 200,
      testPath: '/authorized?trustme=true',
      testKey: 'text',
      testVal: 'Authorized',
      handler: (_, res, ctx: RouteContext<string, AuthMiddlewareCtx>) => {
        if (ctx?.authorized) {
          res.sendText(200, 'Authorized')
        } else {
          res.sendServerError()
        }
      },
      config: {
        middleware: [authMiddleware],
      },
    },
    {
      path: '/root-middlware',
      method: 'get',
      code: 200,
      testPath: '/root-middlware',
      testKey: 'body',
      testVal: { root: true },
      handler: (_, res, ctx: RouteContext<string, RootMiddlwareCtx>) => {
        res.sendJson(200, { root: ctx?.root })
      },
    },
    {
      path: '/async-handler',
      method: 'post',
      code: 200,
      testPath: '/async-handler',
      testKey: 'body',
      testVal: { success: true },
      handler: async (_, res) => {
        const success = await new Promise((resolve) => {
          setTimeout(() => resolve(true), 150)
        })
        res.sendJson(200, { success })
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
          middleware: [authMiddleware],
          routes: [
            {
              path: '/',
              method: 'get',
              code: 200,
              testPath: '/users/32?trustme=true',
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
              testPath: '/users/12?trustme=true',
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
              testPath: '/users/3948?trustme=true',
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
              testPath: '/users/204921?trustme=true',
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
  const router = new Router({
    middleware: [rootMiddlware],
  })
  makeRoutes(router, routes)
  makeRouteGroup(router, groups)
  return router
}

function testRoutes(server: Server, routes: RouteNode[], prefix: string = '') {
  for (const route of routes) {
    it(`Route(${route.method}): ${prefix}${route.path})`, async () => {
      if (route.method === 'get') {
        const [getRes, headRes] = await Promise.all([
          request(server).get(route.testPath),
          request(server).head(route.testPath),
        ])
        expect(getRes.status).toBe(route.code)
        expect(getRes[route.testKey]).toEqual(route.testVal)
        expect(headRes.status).toBe(route.code)
        expect(headRes.body).toEqual({})
        expect(headRes.text).toBeUndefined()
      } else if (route.method === 'head') {
        const res = await request(server).head(route.testPath)
        expect(res.status).toBe(route.code)
        expect(res[route.testKey]).toEqual(route.testVal)
      } else if (allowedBodyMethods.has(route.method.toUpperCase() as RouteMethod)) {
        const res = await request(server)[route.method](route.testPath).send(route.testVal)
        expect(res.status).toBe(route.code)
        expect(res[route.testKey]).toEqual(route.testVal)
      } else {
        throw new Error(`Route Method (${route.method}): does not have a test case!`)
      }
    })
  }
}

function testGroups(server: Server, groups: RouteGroupNode[], prefix: string = '') {
  for (const group of groups) {
    const newPrefix = `${prefix}${group.path}`
    testRoutes(server, group.routes, newPrefix)
    testGroups(server, group?.groups || [], newPrefix)
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

  it('Method Not Found', async () => {
    const path = routeMap.routes[0]?.testPath
    const res = await request(server).delete(path)
    expect(res.statusCode).toBe(405)
    expect(res.header?.allow).toEqual('GET, HEAD, OPTIONS')
  })

  it('Auto Generate Options', async () => {
    const path = routeMap.groups[0]?.path
    const res = await request(server).options(path)
    expect(res.statusCode).toBe(204)
    expect(res.header?.allow).toEqual('GET, POST, HEAD, OPTIONS')
  })

  describe('Individual Routes', () => {
    testRoutes(server, routeMap.routes)
  })

  describe('Grouped Routes', () => {
    testGroups(server, routeMap.groups)
  })
})
