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

            if (calc === 'DEF') {
                if (typeof value === 'undefined') {
                    return next(ApiError.badReq('Укажите значение показателя'))
                }
                let result = await KPI_value.create({
                    kpiTypeId,
                    userId,
                    value,
                    description,
                    startDate: new Date(),
                    isLast: true
                })
                return res.json(result)
            }
            
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
            if (achieves.length === 0) {
              return next(ApiError.badReq('Нет достижений'));
            }
            const last = achieves.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            

            achieves.sort((a, b) => new Date(a.date) - new Date(b.date))

            for (let i = 0; i < achieves.length; i++) {
                const pre = achieves.slice(0, i + 1)
                const vals = []
                for (let achieve of pre) {
                    const vs = achieve.achieve_attribute_values
                        .filter(v => v.achieve_type_attribute.name === kpiType.sourceAtributeName)
                        .map(v => parseFloat(v.value))
                    vals.push(...vs)
                }
                let result 
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

                const kpiValue = await KPI_value.create({
                    kpiTypeId,
                    userId,
                    value: result,
                    description,
                    startDate: achieves[i].date,
                    isLast: achieves[i].date === last ? true : false
                })
            }
            return res.json({message: 'Создано'})
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async delete (req, res, next) {
        const { userId, typeId } = req.params
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
              return next(ApiError.badReq('Пользователь не найден'))
            }
            
            const owner = await User.findByPk(userId)
            if (owner.id !== user.id && user.role !== 'hr' || user.role === 'hr' && user.companyId !== owner.companyId) {
                return next(ApiError.badReq('Нет доступа'))
            }

            const vals = await KPI_value.findAll({where: {userId, kpiTypeId: typeId}})
            if (!vals) {
                return next(ApiError.badReq('Показатель не найден'))
            }

            for (const val of vals) {
                await val.destroy()
            }

            return res.json('')
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