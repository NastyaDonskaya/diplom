const { where } = require('sequelize')
const ApiError = require('../error/apiError')
const {Achievement, AchievementType, AchievementTypeAttribute, User, KPI_value, KPI_type, AchievementAttributeValue} = require('../models/models')

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
                const temp = a.userId
                await a.destroy()
                await recalculate(temp)
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