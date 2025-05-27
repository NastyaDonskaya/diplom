const Router = require('express')
const router = new Router()
const kpitypeController = require('../controllers/kpitypeController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', checkRoleMiddleware('hr'), kpitypeController.create)
router.get('/', authMiddleware, kpitypeController.getAll)
router.get('/:id', authMiddleware, kpitypeController.getOne)
router.delete('/:id', checkRoleMiddleware('hr'), kpitypeController.delete)

module.exports = router