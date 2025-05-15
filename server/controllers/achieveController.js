const {Achievement, AchievementAttributeValue, AchievementType, AchievementTypeAttribute, User, Company} = require('../models/models')
const ApiError = require('../error/apiError')
const sequelize = require('../db')
const { where } = require('sequelize')

class AchiveController {

    async create(req, res, next) {
        try {
            const {name, description, date, userId, achieveTypeId, attributes} = req.body
            if (!name || !userId || !achieveTypeId || !Array.isArray(attributes)) {
                return next(ApiError.badReq('Заполните поля'))
            }

            if (req.user.role !== 'hr' && req.user.id !== userId) {
                return next(ApiError.badReq('Вы можете добавлять достижения только себе'));
            }
            
            const owner = await User.findByPk(userId)
            if (req.user.role === 'hr' && req.user.companyId !== owner.companyId) {
                return next(ApiError.badReq('Вы можете добавлять достижения только участникам вашей компании'))
            }
            
            const achieveTypeAttributes = await AchievementTypeAttribute.findAll({
                where: { achieveTypeId }
            })

            if (!achieveTypeAttributes || achieveTypeAttributes.length === 0) {
                return next(ApiError.badReq('Не найдены атрибуты для данного типа достижения'));
            }

            const validIds = achieveTypeAttributes.map(attr => attr.id);
            for (const attr of attributes) {
                if (!attr.attributeId || !validIds.includes(attr.attributeId)) {
                    return next(ApiError.badReq('Передан недопустимый attributeId'));
                }
                if (typeof attr.value === 'undefined' || attr.value === '') {
                    return next(ApiError.badReq('Атрибут не содержит значение'));
                }
            }

            const achievement = await Achievement.create({
                name,
                description, 
                date,
                userId,
                achieveTypeId,
                createdBy: req.user.id
            })

            const valuesCreate = attributes.map(attr => ({
                value: attr.value,
                achieveId: achievement.id,
                achieveTypeAttributeId: attr.attributeId
            }))

            await AchievementAttributeValue.bulkCreate(valuesCreate);

            return res.json(achievement);

        } catch(e) {
            next(ApiError.badReq(e.message))
        }
    }

    // свои достижения
    async getMine(req, res, next) {
        try {
            const userId = req.user.id
            const { typeId } = req.query; // для фильтрации

            const result = []
            const achievements = await Achievement.findAll({where: typeId ? {userId, achieveTypeId: typeId} : {userId}})
            for (let achieve of achievements) {
                const attrs = await AchievementAttributeValue.findAll(
                    {where: {achieveId: achieve.id}},
                )
                const attrNames = await Promise.all(attrs.map(async (a) => {
                    const attrType = await AchievementTypeAttribute.findOne({
                        where: { id: a.achieveTypeAttributeId },
                        attributes: ['name']
                    })
                    return {
                        name: attrType ? attrType.name : 'Неизвестный атрибут',
                        value: a.value,
                    }
                }))

                const achieveName = await AchievementType.findOne({where: {id: achieve.achieveTypeId}, attributes: ["name"]})

                const achieveData = {
                    id: achieve.id,
                    name: achieve.name,
                    description: achieve.description,
                    achieveTypeName: achieveName ? achieveName.name : 'Неизвестный тип',
                    date: achieve.date,
                    attributes: attrNames, 
                }
                result.push(achieveData)
            }
    
            return res.json(result)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }
    // для hr
    async getAll(req, res, next) {
        try {
            const userId = req.user.id
            const hrUser = await User.findByPk(userId)

            const members = await User.findAll({where: {companyId: hrUser.companyId}})
            const membersIds = members.map(e => e.id)

            const {typeId, dateFrom, dateTo} = req.query

            const whereFilter = {userId: membersIds}
            if (typeId) {
                whereFilter.achieveTypeId = typeId
            }
            if (dateFrom) {
                whereFilter.date = { [Op.gte]: new Date(dateFrom) } 
            }
            if (dateTo) {
                whereFilter.date = { [Op.lte]: new Date(dateTo) } 
            }

            const achievements = await Achievement.findAll({where: whereFilter})
            const result = []

            for (let achieve of achievements) {
                const attrs = await AchievementAttributeValue.findAll({
                    where: {achieveId: achieve.id}
                })
                const attrNames = await Promise.all(attrs.map(async (a) => {
                    const attrType = await AchievementTypeAttribute.findOne({
                        where: { id: a.achieveTypeAttributeId },
                        attributes: ['name']
                    })
                    return {
                        name: attrType ? attrType.name : 'Неизвестный атрибут',
                        value: a.value,
                    }
                }))
                const achieveType = await AchievementType.findOne({
                    where: { id: achieve.achieveTypeId },
                    attributes: ['name']
                });
    
                const user = await User.findOne({
                    where: { id: achieve.userId },
                    attributes: ['id', 'name', 'surname']
                });

                result.push({
                    id: achieve.id,
                    user: user ? { id: user.id, name: user.name, surname: user.surname } : null,
                    name: achieve.name,
                    description: achieve.description,
                    date: achieve.date,
                    typeName: achieveType ? achieveType.name : 'Неизвестный тип',
                    attributes: attrNames
                });
            }

            return res.json(result)

        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            const userId = req.user.id
            
            const achieve = await Achievement.findByPk(id)
            if (!achieve) {
                return next(ApiError.notFound("Не найдено"))
            }
        
            if (achieve.userId !== userId && req.user.role !== 'hr' && req.user.role !== 'ceo') {
                return next(ApiError.forbidden("Нет доступа"));
            }
        
            await achieve.destroy();
            return res.json({ message: "Удалено" });
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const userId = req.user.id
            const achieveId = req.params.id

            const user = await User.findByPk(userId)
            if (!user) {
                return next(ApiError.badReq('Пользователь не найден'))
            }

            const achieve = await Achievement.findByPk(achieveId)
            if (!achieve) {
                return next(ApiError.badReq('Достижение не найдено'))
            }

            if (user.role === 'hr') {
                const ownerUser = await User.findByPk(achieve.userId)
                if (ownerUser.companyId !== user.companyId) {
                    return next(ApiError.badReq('Нет доступа'))
                }
            }
            else {
                if (achieve.userId !== userId) {
                    return next(ApiError.badReq('Нет доступа'))
                }
            }

            const attrs = await AchievementAttributeValue.findAll({
                where: {achieveId: achieve.id}
            })

            const attrNames = await Promise.all(attrs.map(async (a) => {
                const attrType = await AchievementTypeAttribute.findOne({
                    where: {id: a.achieveTypeAttributeId},
                    attributes: ['name']
                })
                return {
                    name: attrType ? attrType.name : '???',
                    value: a.value
                }
            }))

            const achieveType = await AchievementType.findOne({
                where: { id: achieve.achieveTypeId },
                attributes: ['name']
            })

            const owner = await User.findOne({
                where: { id: achieve.userId },
                attributes: ['id', 'name', 'surname']
            })

            const result = {
                id: achieve.id,
                user: owner ? {
                    id: owner.id,
                    name: owner.name,
                    surname: owner.surname
                } : null,
                name: achieve.name,
                description: achieve.description,
                date: achieve.date,
                typeName: achieveType ? achieveType.name : 'Неизвестный тип',
                attributes: attrNames
            }

            return res.json(result)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }

    async getUserAchieves (req, res, next) {
        const {userId} = req.params
        if (!userId) {
            return next(ApiError.badReq('нет id пользователя'))
        }

        const user = await User.findByPk(userId)
        if (!user) {
            return next(ApiError.badReq('Пользователь не найден'))
        }

        if (req.user.role !== 'hr' && req.user.id !== +userId || req.user.role === 'hr' && req.user.companyId !== user.companyId) {
            return next(ApiError.badReq('Нет доступа'))
        }

        try {
            const achieves = await Achievement.findAll({
                where: {userId},
                include: [{model: AchievementType}]
            })
            return res.json(achieves)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }
    
}

module.exports = new AchiveController
