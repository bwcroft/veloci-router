import type { RouteHandler } from '@bwcroft/octane'
import type { UserLoggerCtx } from '../middleware/userMiddleware.js'

export const getUsers: RouteHandler = (req, res, ctx) => {
  if ('user' in ctx) {
    res.send(ctx.user)
  } else {
    res.unauthorized('Unauthorized')
  }
}

export const getUser: RouteHandler<'id', UserLoggerCtx> = (req, res, ctx) => {
  if (ctx.user) {
    res.send(ctx.user)
  } else {
    res.notFound()
  }
}
