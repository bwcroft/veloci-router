import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { Router } from './router.js'
import { RouteConfig, RouteHandler, RouteMethod, RouteMiddleware } from '../types/index.js'

type Server = ReturnType<Router['createServer']>

interface RouteNode {
  path: string
  code: number
  method: Lowercase<RouteMethod>
  handler: RouteHandler
  testPath: string
  testKey: 'body' | 'text'
  testVal: unknown
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
      path: '/speed',
      method: 'get',
      code: 200,
      testPath: '/speed',
      testKey: 'body',
      testVal: { speed: 'test' },
      handler: (req, res) => {
        res.sendJson(200, { speed: 'test' })
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
            res.sendJson(201, {})
          },
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

function testRoutes(rotuer: Router, server: Server, routes: RouteNode[]) {
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
      } else if (route.method === 'post') {
        const res = await request(server).post(route.testPath)
        expect(res.status).toBe(route.code)
        expect(res[route.testKey]).toEqual(route.testVal)
      }
    })
  }
}

describe('Router', () => {
  const router = makeRouter(routeMap)
  const server = router.createServer()

  testRoutes(router, server, routeMap.routes)
  for (const group of routeMap.groups) {
    testRoutes(router, server, group.routes)
  }
})
