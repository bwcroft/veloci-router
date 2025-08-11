import { RouteMiddleware } from '@bwcroft/octane'
import { User } from '../models/user.js'

export interface UserLoggerCtx {
  user: User
}

export const getUserMiddleware: RouteMiddleware<'id', UserLoggerCtx> = (_, res, ctx, next) => {
  const id = Number(ctx.params.id)
  if (!id || isNaN(id)) return

  ctx.user = {
    id,
    first: 'Bob',
    last: 'Johnsen',
    email: 'bobjohnsen@test.com',
    age: Math.floor(Math.random() * (90 - 20 + 1)) + 20,
  }

  next()
}
