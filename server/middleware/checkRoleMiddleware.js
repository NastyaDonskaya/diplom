const jwt = require('jsonwebtoken')

module.exports = function(role) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.headers.authorization?.split(' ')[1] // type 1nennfo2rorkpkp
            if (!token) {
                return res.status(401).json({message: 'Пользователь не авторизован'})
            }
    
            const decode = jwt.verify(token, process.env.SECRET_KEY)
            if (decode.role !== role) {
                return res.status(403).json({message: "Нет доступа"})
            }
            req.user = decode
            next()
        } catch (e) {
            res.status(401).json({message: 'Пользователь не авторизован'})
        }
    }
}





