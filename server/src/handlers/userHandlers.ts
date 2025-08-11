import type { RouteHandler } from '@bwcroft/octane'
import type { UserLoggerCtx } from '../middleware/userMiddleware.js'

export const getUsers: RouteHandler = (req, res, ctx) => {
  if ('user' in ctx) {
    res.sendJson(200, ctx.user)
  } else {
    res.sendJson(200, 'No user found')
  }
}

export const getUser: RouteHandler<'id', UserLoggerCtx> = (req, res, ctx) => {
  if (ctx.user) {
    res.sendJson(200, ctx.user)
  } else {
    res.sendNotFound()
  }
}
