const ApiError = require('../error/apiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Company} = require('../models/models')

const makeJWT = (id, email, role, name, surname, companyId, companyName) => {
    return jwt.sign(
        {id, email, role, name, surname, companyId, companyName},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController { 
    async registration(req, res, next) {
        const {email, password, role, name, surname, age, companyName, companyPassword} = req.body
        if (!(email && password && role && name && surname && age)) {
            return next(ApiError.badReq('введите все данные'))
        }

        const isReg = await User.findOne({where: {email}})
        if (isReg) {
            return next(ApiError.badReq('Пользователь с таким email уже существует'))
        }

        const hashPassword = await bcrypt.hash(password, 4)

        if (!companyName || !companyPassword) {
            return next(ApiError.badReq('Введите данные компании'))
        }

        if (role !== 'ceo' && role !== 'hr' && role !== 'emp') {
            return next(ApiError.badReq('Не валидная роль'))
        }

        let user, company;
        
        if (role === 'ceo') {
            const companyHashPassword = await bcrypt.hash(companyPassword, 4);
            company = await Company.create({name: companyName, password: companyHashPassword}) 
            await company.save();

        } else {

            company = await Company.findOne({where : {name: companyName}})
            if (!company) {
                return next(ApiError('Компания не найдена'))
            }

            const isRealPassword = await bcrypt.compare(companyPassword, company.password)
            if (!isRealPassword) {
                return next(ApiError('Неверный пароль'))
            }

        }

        user = await User.create({
            email,
            password: hashPassword,
            role,
            name,
            surname,
            age,
            companyId: company.id
        });

        const token = makeJWT(user.id, user.email, user.role, user.name, user.surname, user.companyId)

        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body

        if (!email || !password) {
            return next(ApiError.badReq('Введите email и пароль'));
        }

        const user = await User.findOne({where: {email}})
        const company = await Company.findByPk(user.companyId)
        if (!user) {
            return next(ApiError.badReq('Нет такого пользователя'))
        }

        const isRealPassword = await bcrypt.compare(password, user.password)
        if (!isRealPassword) {
            return next(ApiError.badReq('Неверный пароль'))
        }
        
        const token = makeJWT(user.id, user.email, user.role, user.name, user.surname, user.companyId, company.name)

        return res.json({token, userId: user.id})
    }

    async getProfile (req, res, next) {
        const {id} = req.params
        try {
            const userProfile = await User.findOne({
                where: {id},
                include: [{
                    model: Company,
                    attributes: ['name']
                }]
            })
            if (!userProfile) {
                return next(ApiError.badReq('Пользователь не найден'))
            }
            return res.json({
                id: userProfile.id,
                email: userProfile.email,
                role: userProfile.role,
                name: userProfile.name,
                surname: userProfile.surname,
                age: userProfile.age,
                company: {
                    id: userProfile.companyId,
                    name: userProfile.company.name
                }
            })
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    } 

    async check_auth(req, res, next) {
        const token = makeJWT(req.user.id, req.user.email, req.user.role, req.user.companyId)
        return res.json({token})
    }

    async getMembers (req, res, next) {
        try {
            const members = await User.findAll({
                where: { companyId: req.user.companyId },
                attributes: ['id', 'email', 'role', 'name', 'surname']
            })
            return res.json(members)
        } catch (e) {
            return next(ApiError.badReq(e.message))
        }   
    }

    
}

module.exports = new UserController()