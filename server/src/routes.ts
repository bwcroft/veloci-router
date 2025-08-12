import { Router } from '@bwcroft/octane'
import { getUser, getUsers } from './handlers/userHandlers.js'
import { getRoot, getSpeed } from './handlers/rootHandlers.js'
import { getUserMiddleware } from './middleware/userMiddleware.js'

const router = new Router()

router.get('/', getRoot)
router.get('/speed', getSpeed)

router.group('/users', (r) => {
  r.get('/', getUsers)
  r.group('/:id', [getUserMiddleware], (ur) => {
    ur.get('/', getUser)
  })
})

export default router
