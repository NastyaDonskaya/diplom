const { where } = require('sequelize')
const ApiError = require('../error/apiError')
const {AchievementType, AchievementTypeAttribute, User, Company} = require('../models/models')

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
                        return next(ApiError.badReq('Укажите варианты значений'));
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