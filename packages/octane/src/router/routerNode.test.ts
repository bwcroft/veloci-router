import { describe, expect, it } from 'vitest'
import { RouterNode } from './routerNode'
import { RouteMethod } from './router'
import { allowedBodyMethods } from '../decorators/requestDecorators'

describe('RouterNode', () => {
  describe('getHandlers', () => {
    it('should return GET handler and fallback to GET handler when HEAD handler is not set', () => {
      const method: RouteMethod = 'GET'
      const node = new RouterNode({
        handlers: new Map([[method, [() => {}]]]),
      })
      expect(node.getHandlers(method)).toBeTruthy()
      expect(node.getHandlers('HEAD')).toBeTruthy()
    })

    for (const method of allowedBodyMethods) {
      it(`should return ${method} handler`, () => {
        const node = new RouterNode({
          handlers: new Map([[method, [() => {}]]]),
        })
        expect(node.getHandlers(method as RouteMethod)).toBeTruthy()
        expect(node.getHandlers('HEAD')).toBeUndefined()
      })
    }
  })

  describe('getOptions', () => {
    const methods: RouteMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

    it('automatically adds HEAD and OPTIONS when GET handler is defined', () => {
      const node = new RouterNode({
        handlers: new Map([['GET', [() => {}]]]),
      })
      const options = node.getOptions()
      expect(options).length(3)
      expect(options).toEqual(expect.arrayContaining(['GET', 'OPTIONS', 'HEAD']))
    })

    it('automatically adds OPTIONS when Post handler is defined', () => {
      const node = new RouterNode({
        handlers: new Map([['POST', [() => {}]]]),
      })
      const options = node.getOptions()
      expect(options).length(2)
      expect(options).toEqual(expect.arrayContaining(['POST', 'OPTIONS']))
    })

    for (let i = 0; i < methods.length; i++) {
      const tmethods: RouteMethod[] = [...methods.slice(0, i + 1), 'OPTIONS', 'HEAD']
      it(`Should reponse with handler methods ${tmethods.join(', ')}`, () => {
        const node = new RouterNode({
          handlers: new Map(tmethods.map((m) => [m, [() => {}]])),
        })
        const options = node.getOptions()
        expect(options).length(i + 3)
        expect(node.getOptions()).toEqual(expect.arrayContaining(tmethods))
      })
    }
  })
})
