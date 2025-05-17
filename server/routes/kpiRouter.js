const Router = require('express')
const router = new Router()
const KpiController = require('../controllers/kpiController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', checkRoleMiddleware('hr'), KpiController.create) 
router.get('/vals/:userId', authMiddleware, KpiController.getValues)

module.exports = router