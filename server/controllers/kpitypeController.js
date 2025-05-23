const ApiError = require('../error/apiError')
const {KPI_type, User} = require('../models/models')

const PERIOD_TYPES = ['DAY', 'WEEK', 'MOUNTH', 'YEAR', 'NONE']
const CALC_TYPES = ['SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'DEF']

class KpiTypeController {

    async create(req, res, next) {
        const user = await User.findByPk(req.user.id);
        if (user.isActive === false) {
            return next(ApiError.badReq('Нет доступа'));
        }
        try {
            const {
                name,
                description,
                calculationType,
                sourceAchieveTypeId,
                sourceAtributeName,
                period,
                numType,
                maxValue
            } = req.body

            const createdBy = req.user.id

            // if (!PERIOD_TYPES.includes(period)) {
            //     return next(ApiError.badReq('Некорректный тип периода'))
            // }

            if (!name || !calculationType || !numType) {
                return next(ApiError.badReq('Укажите все обязательные параметры'))
            }

            if (calculationType !== 'DEF' && calculationType !== 'COUNT' && (!sourceAchieveTypeId || !sourceAtributeName)) {
                return next(ApiError.badReq('Укажите источник рассчета'))
            }

            // if (period !== 'NONE') {
            //     if (!startDate || !endDate) {
            //         return next(ApiError.badReq('Укажите даты периода'))
            //     }
            // }
            

            const KPItype = await KPI_type.create({
                name,
                description,
                calculationType,
                sourceAchieveTypeId: calculationType === 'DEF' ? null : sourceAchieveTypeId,
                sourceAtributeName: calculationType === 'DEF' ? null : sourceAtributeName,
                period,
                numType,
                maxValue,
                createdBy,
                companyId: req.user.companyId
            })

            return res.json(KPItype)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getAll(req, res, next) {
        const user = await User.findByPk(req.user.id);
        if (user.isActive === false) {
            return next(ApiError.badReq('Нет доступа'));
        }
        try {
            const kpi_types = await KPI_type.findAll()
            return res.json(kpi_types)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

}

module.exports = new KpiTypeController;


