const ApiError = require('../error/apiError')
const {KPI_value, KPI_type, Achievement, AchievementAttributeValue, AchievementTypeAttribute, User} = require('../models/models')

class KpiController {
    async create(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id);
            if (user.isActive === false) {
                return next(ApiError.badReq('Нет доступа'));
            }
            const { kpiTypeId, userId, value, description } = req.body

            if (!kpiTypeId || !userId) {
                return next(ApiError.badReq('Укажите обязательные параметры'))
            }

            const kpiType = await KPI_type.findByPk(kpiTypeId)
            if (!kpiType) {
                return next(ApiError.badReq('Тип кпи не найден'))
            }

            const lastVals = await KPI_value.findAll({where: {userId, kpiTypeId, isLast: true}});
            for (let val of lastVals) {
                await val.update({ isLast: false })
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
        const { userId, kpiTypeId } = req.params

        const owner = await User.findByPk(userId)
        if (!owner) {
            return next(ApiError.badReq('Пользователь не найден'))        
        }

        const user = await User.findByPk(req.user.id);

        if (req.user.role !== 'hr' && req.user.id !== +userId || req.user.role === 'hr' && req.user.companyId !== owner.companyId || user.isActive === false) {
            return next(ApiError.badReq('Нет доступа'))
        }

        if (!userId) {
            return next(ApiError.badReq('Введите id пользователя'))
        }
        try {
            const whereFilter = { userId }
            if (kpiTypeId) {
                whereFilter.kpiTypeId = kpiTypeId
            }
            const vals = await KPI_value.findAll({
                where: whereFilter,
                include: [{ model: KPI_type }]
            })
            return res.json(vals)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getLastValues (req, res, next) {
        const { userId } = req.params

        const owner = await User.findByPk(userId)
        if (!owner) {
            return next(ApiError.badReq('Пользователь не найден'))        
        }

        const user = await User.findByPk(req.user.id);

        if (req.user.role !== 'hr' && req.user.id !== +userId || req.user.role === 'hr' && req.user.companyId !== owner.companyId || user.isActive === false) {
            return next(ApiError.badReq('Нет доступа'))
        }

        if (!userId) {
            return next(ApiError.badReq('Введите id пользователя'))
        }
        try {
            const vals = await KPI_value.findAll({
                where: {userId, isLast: true},
                include: [
                    {model: KPI_type, attributes: ['id', 'name']},
                    {model: User, attributes: ['id', 'name', 'surname', 'role']}
                ]
            })
            return res.json(vals)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getCompanyLast (req, res, next) {
        try {
            const user = await User.findByPk(req.user.id)

            const members = await User.findAll({
                where: {companyId: user.companyId, isActive: true},
                attributes: ['id']
            })

            const ids = members.map(m => m.id)

            const { typeId } = req.query

            const whereFilter = {userId: ids, isLast: true}
            if (typeId) {
                whereFilter.kpiTypeId = typeId
            }

            const vals = await KPI_value.findAll({
                where: whereFilter,
                include: [
                    {model: KPI_type, attributes: ['id', 'name']},
                    {model: User, attributes: ['id', 'name', 'surname', 'role']}
                ]
            })

            return res.json(vals)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
          const { typeId } = req.query

          const whereFilter = {}
          if (typeId) {
            whereFilter.kpiTypeId = typeId
          }

          const kpis = await KPI_value.findAll({
            whereFilter,
            include: [
              { model: KPI_type },
              {
                model: User,
                attributes: ['id', 'name', 'surname', 'role'],
              },
            ],
          })

          const data = kpis.map((k) => ({
            id: k.id,
            value: k.value,
            date: k.date,
            typeName: k.kpi_type.name,
            user: k.user,
          }))

          return res.json(data)
        } catch (e) {
            return next(ApiError.badReq(e.message)) 
        }
  }
}

module.exports = new KpiController;