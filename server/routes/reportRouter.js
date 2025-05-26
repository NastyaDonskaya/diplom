const Router = require('express')
const router = new Router()

const ReportController = require('../controllers/reportController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/user/:userId', authMiddleware, ReportController.makeReport)

module.exports = router;