const { where } = require('sequelize')
const ApiError = require('../error/apiError')
const {Achievement, AchievementType, AchievementTypeAttribute, User, KPI_value, KPI_type, AchievementAttributeValue} = require('../models/models')

async function recalculate(userId) {
    const kpiTypes = await KPI_type.findAll()
    await KPI_value.destroy({where: {userId}})

    for (const type of kpiTypes) {
        const calc = type.calculationType
        if (calc === 'DEF') {
            continue
        }
        const achieveTypeId = type.sourceAchieveTypeId
        const attrName = type.sourceAtributeName

        const achieves = await Achievement.findAll({
            where: { userId, achieveTypeId },
            include: [{
                model: AchievementAttributeValue,
                include: [{
                    model: AchievementTypeAttribute,
                    where: { name: attrName }
                }]
            }]
        })
        if (achieves.length === 0) {
            continue;
        }
        achieves.sort((a, b) => new Date(a.date) - new Date(b.date))
        const last = achieves[achieves.length - 1].date

        for (let i = 0; i < achieves.length; i++) {

            const pre = achieves.slice(0, i + 1);

            const vals = []
            for (const achieve of pre) {
                const vs = achieve.achieve_attribute_values
                    .filter(v => v.achieve_type_attribute.name === attrName)
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

            await KPI_value.create({
                kpiTypeId: type.id,
                userId,
                value: result,
                startDate: achieves[i].date,
                isLast: achieves[i].date === last
            });
        }
    }
}

class AchievetypeController {

    async create(req, res, next) {
        try {
            const {name, description, attributes} = req.body
            
            const userId = req.user.id
            const companyId = req.user.companyId

            if (!name) {
                return next(ApiError.badReq('Не заполнены поля'))
            }

            const achievementType = await AchievementType.create({
                name,
                description,
                createdBy: userId,
                companyId
            })

            if (Array.isArray(attributes)) {
                for (const a of attributes) {
                    const {name, dataType, isRequired, enumValues} = a

                    if (dataType === 'ENUM' && (!Array.isArray(enumValues) || enumValues.length === 0)) {
                        return next(ApiError.badReq('Укажите варианты значений'))
                    }

                    await AchievementTypeAttribute.create({
                        name, 
                        dataType,
                        isRequired: isRequired || false,
                        achieveTypeId: achievementType.id,
                        enumValues: dataType === 'ENUM' ? enumValues : null
                    })
                }
            }
            return res.json(achievementType)

        } catch(e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async delete (req, res, next) {
        try {
            const {id} = req.params
            const achieveType = await AchievementType.findByPk(id)
            if (!achieveType) {
                return next(ApiError.badReq('Тип не найден'))
            }

            if (!(req.user.role === 'hr' && req.user.companyId === achieveType.companyId)) {
                return next(ApiError.badReq('Нет доступа'))
            }

            const achieves = await Achievement.findAll({
                where: {achieveTypeId: id}
            }) 
            for (let a of achieves) {
                await AchievementAttributeValue.destroy({
                    where: {achieveId: a.id}
                })
                const temp = a
                await a.destroy()
                await recalculate(temp.userId)
            }

            await AchievementTypeAttribute.destroy({
                where: {achieveTypeId: id}
            })

            await achieveType.destroy()

            return res.json({message: 'Удалено'})
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getAttrs(req, res, next) {
        try {
            const {id} = req.params
            const attrs = await AchievementTypeAttribute.findAll({where: {achieveTypeId: id}})
            return res.json(attrs)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const userId = req.user.id
            const user = await User.findOne({where: {id: userId}})

            if (!user || !user.companyId) {
                return res.status(404).json({ message: 'Компания пользователя не найдена.' });
            }

            const companyId = user.companyId

            const achieveTypes = await AchievementType.findAll({where: {companyId}})

            if (!achieveTypes.length) {
                return res.status(404).json({ message: 'Типы достижений не найдены.' })
            }

            return res.json(achieveTypes)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }  
    }

    async getType (req, res, next) {
        try {
            const { id } = req.params
            const achieveType = await AchievementType.findOne({
                where: {id},
                include: [{
                    model: AchievementTypeAttribute
                }]
            })

            if (!achieveType) {
                return next(ApiError.badReq('Не найдено'))
            }

            return res.json(achieveType)

        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }
}

module.exports = new AchievetypeController;