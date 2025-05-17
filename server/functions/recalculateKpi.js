import { KPI_type, KPI_value, User } from "../models/models";

async function recalculate (userId) {
    const user = User.findByPk(userId)
    const vals = KPI_value.findAll({
        where: {userId},
        include: [{model: KPI_type}]
    })
    for (let val of vals) {
        const kpiType = val.KPI_type
        if (kpiType === 'DEF') {
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
        val.value = result
        await val.save()
    }
}