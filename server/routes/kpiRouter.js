const Router = require('express')
const router = new Router()
const KpiController = require('../controllers/kpiController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', checkRoleMiddleware('hr'), KpiController.create) 
router.get('/vals/:userId/:kpiTypeId', authMiddleware, KpiController.getValues)
router.get('/vals/:userId', authMiddleware, KpiController.getValues)
router.get('/lastvals/:userId', authMiddleware, KpiController.getLastValues)
router.get('/all', authMiddleware, KpiController.getAll)
router.get('/company/kpis', authMiddleware, KpiController.getCompanyLast)
router.delete('/:userId/:typeId', authMiddleware, KpiController.delete)


module.exports = router