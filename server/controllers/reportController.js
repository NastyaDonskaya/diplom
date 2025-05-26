const fs = require('fs')
const path = require('path')
const ApiError = require('../error/apiError')

const { User, Achievement, AchievementType, AchievementAttributeValue, AchievementTypeAttribute, Company } = require('../models/models')

const roles = {
    'ceo': 'Руководитель',
    'hr': 'HR-менеджер',
    'emp': 'Сотрудник'
}

class ReportController {
    async makeReport(req, res, next) {
        const { userId } = req.params

        try {
            const user = await User.findByPk(userId, {include: [{ model: Company }]})
            if (!user) {
                return next(ApiError.badReq('Пользователь не найден'))
            }
            if (req.user.role !== 'hr' && req.user.role !== 'ceo' && req.user.id !== +userId || (req.user.role === 'hr' || req.user.role === 'ceo') && req.user.companyId !== user.companyId) {
                return next(ApiError.badReq('Нет доступа'))
            }

            const achieves = await Achievement.findAll({where: {userId}})

            let text = `Отчет по сотруднику: ${user.name} ${user.surname}\n`
            text += `Роль: ${roles[user.role]}\n`
            text += `Компания: ${user.company.name}\n`
            text += `Дата: ${new Date().toLocaleDateString()}\n\n`

            text += `Достижения: \n`
            for (let [index, achieve] of achieves.entries()) {
                const type = await AchievementType.findByPk(achieve.achieveTypeId);
                const attrs = await AchievementAttributeValue.findAll({
                    where: { achieveId: achieve.id }
                });

                const attrsText = await Promise.all(attrs.map(async (attr) => {
                    const attrType = await AchievementTypeAttribute.findByPk(attr.achieveTypeAttributeId);
                    return `  - ${attrType?.name || 'Неизвестный атрибут'}: ${attr.value}`;
                }));

                text += `${index + 1}. Название: ${achieve.name}\n`;
                text += `   Тип: ${type?.name || 'неизвестен'}\n`;
                text += `   Дата: ${new Date(achieve.date).toLocaleDateString()}\n`;
                text += `   Описание: ${achieve.description || 'нет описания'}\n`;
                text += `   Атрибуты:\n${attrsText.join('\n')}\n\n`;
            }
            const reportsDir = path.join(__dirname, '..', 'reports');
            if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

            const filePath = path.join(reportsDir, `report-user-${userId}.txt`);
            fs.writeFileSync(filePath, text, 'utf8');

            return res.download(filePath);

        } catch (e) {
            return next(ApiError.badReq(e.message))
        }
    }
}

module.exports = new ReportController;