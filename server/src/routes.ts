import { Router } from '@bwcroft/veloci-router'

const router = new Router()

router.get('/', (_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      name: 'Server',
      version: '1.0.0',
    }),
  )
})

router.get('/speed', (_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ hello: 'world' }))
})

export default router
