const Router = require('express')
const router = new Router()
const AchieveController = require('../controllers/achieveController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', authMiddleware, AchieveController.create)
router.get('/all', authMiddleware, AchieveController.getAll)
router.get('/my', authMiddleware, AchieveController.getMine)
router.get('/all/:userId', authMiddleware, AchieveController.getUserAchieves)
router.get('/:id', authMiddleware, AchieveController.getOne)
router.put('/:id', authMiddleware, AchieveController.update)
router.get('/attr-values/:typeId', authMiddleware, AchieveController.getAttributeValues)


module.exports = router