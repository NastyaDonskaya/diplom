const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check_auth)
router.get('/profile/:id', authMiddleware, userController.getProfile)
router.get('/members', authMiddleware, userController.getMembers)
router.get('/members/query', authMiddleware, userController.getQuery)
router.post('/members/query/:id/accept', authMiddleware, userController.acceptMember)
router.delete('/members/:id', authMiddleware, userController.removeMember)



module.exports = router