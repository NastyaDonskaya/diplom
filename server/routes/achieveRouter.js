const Router = require('express')
const router = new Router()
const AchiveController = require('../controllers/achieveController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', authMiddleware, AchiveController.create)
router.get('/all', checkRoleMiddleware('hr'), AchiveController.getAll)
router.get('/my', authMiddleware, AchiveController.getMine)
router.get('/:id', authMiddleware, AchiveController.getOne)

module.exports = router