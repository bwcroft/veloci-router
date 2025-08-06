import type { RouteHandler } from '@bwcroft/octane'

interface User {
  first: string
  last: string
  email?: string
}

export const getUser: RouteHandler<'id', { user: User }> = (req, res, ctx) => {
  const { id } = ctx.params
  res.sendText(200, `UserId: ${id}`)
}
