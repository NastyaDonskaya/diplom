const Router = require('express')
const router = Router()

const userRouter = require('./userRouter')
const achieveRouter = require('./achieveRouter')
const kpiRouter = require('./kpiRouter')
const achieveTypeRouter = require('./achievetypeRouter')
const kpitypeRouter = require('./kpitypeRouter')
const reportRouter = require('./reportRouter')


router.use('/user', userRouter)
router.use('/achieve', achieveRouter)
router.use('/kpi', kpiRouter)
router.use('/achieve_type', achieveTypeRouter)
router.use('/kpi_type', kpitypeRouter)
router.use('/report', reportRouter)


module.exports = router