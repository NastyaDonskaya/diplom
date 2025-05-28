const ApiError = require('../error/apiError')
const {KPI_type, User, AchievementTypeAttribute, KPI_value, AchievementAttributeValue} = require('../models/models')

async function recalculate (userId) {
    const lastVals = await KPI_value.findAll({
        where: {userId, isLast: true},
        include: [{model: KPI_type}]
    })
    for (let val of lastVals) {
        const kpiType = val.kpi_type
        await val.update({ isLast: false })
        if (kpiType === 'DEF') {
            await KPI_value.create({
                kpiTypeId: kpiType.id,
                userId,
                value: val.value,
                description: val.description,
                isLast: true
            });
            continue
        }
        const calc = kpiType.calculationType
        const achieveTypeId = kpiType.sourceAchieveTypeId
        const attrName = kpiType.sourceAtributeName

        const attrs = await AchievementAttributeValue.findAll({
            include: [{
                model: Achievement,
                where: {
                    userId,
                    achieveTypeId: achieveTypeId
                },
                attributes: []
            }, {
                model: AchievementTypeAttribute,
                where: { name: attrName },
                attributes: []
            }],
            attributes: ['value']
        })

        const values = attrs.map(a => parseFloat(a.value) || 0)

        let result
        if (calc === 'SUM') {
            let sum = 0
            for (let v of values) {
                sum += v
            }
            result = sum
        } else if (calc === 'COUNT') {
            let cnt = 0
            for (let v of values) {
                cnt += 1
            }
            result = cnt
        } else if (calc === 'AVG') {
            let sum = 0
            let cnt = 0
            for (let v of values) {
                sum += v
                cnt += 1
            }
            result = cnt ? sum / cnt : 0
        } else if (calc === 'MAX') {
            result = Math.max.apply(null, values) 
        } else if (calc === 'MIN') {
            result = Math.min.apply(null, values)
        } else {
            return ApiError.badReq('Неверный тип рассчета')
        } 
        await KPI_value.create({
            kpiTypeId: kpiType.id,
            userId,
            value: result,
            description: val.description,
            isLast: true
        });
    }
}

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
        const user = await User.findByPk(req.user.id)
        if (user.isActive === false) {
            return next(ApiError.badReq('Нет доступа'))
        }
        try {
            const { calcType } = req.query
            const whereFilter = {companyId: user.companyId}
            if (calcType) {
                whereFilter.calcType = calcType
            }
            const kpi_types = await KPI_type.findAll({where: whereFilter})
            return res.json(kpi_types)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getOne (req, res, next) {
        const user = await User.findByPk(req.user.id)
        if (!user.isActive) {
            return next(ApiError.badReq('Нет доступа'))
        }
        try {
            const { id } = req.params
            const kpiType = await KPI_type.findByPk(id)
            if (!kpiType) {
                return next(ApiError.badReq('Тип не найден'))
            }
            return res.json(kpiType)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async delete (req, res, next) {
        try {
            const { id } = req.params
            const user = await User.findByPk(req.user.id)
            if (!user.isActive) {
                return next(ApiError.badReq('Нет доступа'))
            }

            const type = await KPI_type.findByPk(id)
            if (!type) {
                return next(ApiError.badReq('Тип не найден'))
            }

            if (user.companyId !== type.companyId) {
                return next(ApiError.badReq('Нет доступа'))
            }

            const vals = await KPI_value.findAll({where: {kpiTypeId: id}})

            for (let val of vals) {
                await val.destroy()
                await recalculate(val.userId)
            }

            await type.destroy()

            return res.json({message: 'Удалено'})
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    } 
}

module.exports = new KpiTypeController;


