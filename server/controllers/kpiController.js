const ApiError = require('../error/apiError')
const {KPI_value, KPI_type, Achievement, AchievementAttributeValue, AchievementTypeAttribute, User} = require('../models/models')

class KpiController {
    async create(req, res, next) {
        try {
            const { kpiTypeId, userId, value, description } = req.body

            if (!kpiTypeId || !userId) {
                return next(ApiError.badReq('Укажите обязательные параметры'))
            }

            const kpiType = await KPI_type.findByPk(kpiTypeId)
            if (!kpiType) {
                return next(ApiError.badReq('Тип кпи не найден'))
            }

            const calc = kpiType.calculationType
            let result

            if (calc === 'DEF') {
                if (typeof value === 'undefined') {
                    return next(ApiError.badReq('Укажите значение показателя'))
                }
                result = value
            }
            else {
                const achieves = await Achievement.findAll({
                    where: {userId, achieveTypeId: kpiType.sourceAchieveTypeId},
                    include: [{
                        model: AchievementAttributeValue,
                        include: [{
                            model: AchievementTypeAttribute,
                            where: {
                                name: kpiType.sourceAtributeName
                            }
                        }]
                    }]
                })
                const vals = []

                for (let achieve of achieves) {
                    for (let attrVal of achieve.achieve_attribute_values) {
                        if (attrVal.achieve_type_attribute?.name === kpiType.sourceAtributeName) {
                            vals.push(parseFloat(attrVal.value))
                        }
                    }
                }

                if (calc === 'SUM') {
                    let sum = 0
                    for (let v of vals) {
                        sum += v
                    }
                    result = sum
                } else if (calc === 'COUNT') {
                    let cnt = 0
                    for (let v of vals) {
                        cnt += 1
                    }
                    result = cnt
                } else if (calc === 'AVG') {
                    let sum = 0
                    let cnt = 0
                    for (let v of vals) {
                        sum += v
                        cnt += 1
                    }
                    result = cnt ? sum / cnt : 0
                } else if (calc === 'MAX') {
                    result = Math.max.apply(null, vals) 
                } else if (calc === 'MIN') {
                    result = Math.min.apply(null, vals)
                } else {
                    return ApiError.badReq('Неверный тип рассчета')
                }
            }
            const kpiValue = await KPI_value.create({
                kpiTypeId,
                userId,
                value: result,
                description
            })

            return res.json(kpiValue)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getValues (req, res, next) {
        const {userId} = req.params

        const user = await User.findByPk(userId)
        if (!user) {
            return next(ApiError.badReq('Пользователь не найден'))        
        }

        if (req.user.role !== 'hr' && req.user.id !== +userId || req.user.role === 'hr' && req.user.companyId !== user.companyId) {
            return next(ApiError.badReq('Нет доступа'))
        }

        if (!userId) {
            return next(ApiError.badReq('Введите id пользователя'))
        }
        try {
            const vals = await KPI_value.findAll({
                where: {userId},
                include: [{ model: KPI_type}]
            })
            return res.json(vals)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }
}

module.exports = new KpiController;