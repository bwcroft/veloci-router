import { Router } from '@bwcroft/octane'
import { getRoot, getSpeed } from './handlers/rootHandlers.js'
import { getUser } from './handlers/userHandlers.js'

const router = new Router()

router.get('/', getRoot)
router.get('/speed', getSpeed)

router.get('/users/:id', getUser)

export default router
