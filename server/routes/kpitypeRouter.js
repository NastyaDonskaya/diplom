const Router = require('express')
const router = new Router()
const kpitypeController = require('../controllers/kpitypeController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', checkRoleMiddleware('hr'), kpitypeController.create)
router.get('/', kpitypeController.getAll)

module.exports = router