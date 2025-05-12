const ApiError = require('../error/apiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Company} = require('../models/models')

const makeJWT = (id, email, role, companyId) => {
    return jwt.sign(
        {id, email, role, companyId},
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

        const token = makeJWT(user.id, user.email, user.role, user.companyId)

        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body

        if (!email || !password) {
            return next(ApiError.badReq('Введите email и пароль'));
        }

        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.badReq('Нет такого пользователя'))
        }

        const isRealPassword = await bcrypt.compare(password, user.password)
        if (!isRealPassword) {
            return next(ApiError.badReq('Неверный пароль'))
        }
        
        const token = makeJWT(user.id, user.email, user.role, user.companyId)

        return res.json({token})
    }

    async check_auth(req, res, next) {
        const token = makeJWT(req.user.id, req.user.email, req.user.role, req.user.companyId)
        return res.json({token})
    }
}

module.exports = new UserController()