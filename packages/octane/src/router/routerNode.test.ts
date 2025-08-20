import { describe, expect, it } from 'vitest'
import { RouterNode } from './routerNode'
import { RouteMethod } from './router'

describe('RouterNode', () => {
  describe('getOptions', () => {
    const methods: RouteMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

    it('automatically adds HEAD and OPTIONS when GET handler is defined', () => {
      const node = new RouterNode({
        handlers: new Map([['GET', [() => {}]]]),
      })
      expect(node.getOptions()).toEqual(expect.arrayContaining(['GET', 'OPTIONS', 'HEAD']))
    })

    it('automatically adds OPTIONS when Post handler is defined', () => {
      const node = new RouterNode({
        handlers: new Map([['GET', [() => {}]]]),
      })
      expect(node.getOptions()).toEqual(expect.arrayContaining(['GET', 'OPTIONS']))
    })

    for (let i = 0; i < methods.length; i++) {
      const tmethods: RouteMethod[] = [...methods.slice(0, i + 1), 'OPTIONS', 'HEAD']
      it(`Should reponse with handler methods ${tmethods.join(', ')}`, () => {
        const node = new RouterNode({
          handlers: new Map(tmethods.map((m) => [m, [() => {}]])),
        })
        expect(node.getOptions()).toEqual(expect.arrayContaining(tmethods))
      })
    }
  })
})
