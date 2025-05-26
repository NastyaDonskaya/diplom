const Router = require('express')
const router = new Router()
const achievetypeController = require('../controllers/achievetypeController')
const checkRole = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', checkRole('hr'), achievetypeController.create)
router.get('/', authMiddleware, achievetypeController.getAll)
router.get('/:id/attributes', authMiddleware, achievetypeController.getAttrs)
router.get('/:id', authMiddleware, achievetypeController.getType)

module.exports = router