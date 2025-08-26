import type { RouteHandler } from '@bwcroft/octane'
import pkg from '../../package.json' with { type: 'json' }

export const getRoot: RouteHandler = (_, res) => {
  res.send({
    name: pkg.name,
    type: pkg.type,
    private: pkg.private,
  })
}

export const getSpeed: RouteHandler = (_, res) => {
  res.send({ hello: 'world' })
}
