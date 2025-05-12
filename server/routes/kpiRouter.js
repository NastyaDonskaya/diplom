const Router = require('express')
const router = new Router()
const KpiController = require('../controllers/kpiController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', checkRoleMiddleware('hr'), KpiController.create) 

module.exports = router