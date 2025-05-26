const sequelize = require('../db')

const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "guest"},
    name: {type: DataTypes.STRING, defaultValue: "-"},
    surname: {type: DataTypes.STRING, defaultValue: "-"},
    age: {type: DataTypes.INTEGER, defaultValue: 0},
    isActive: {type: DataTypes.BOOLEAN, defaultValue: false}
})

const Company = sequelize.define('company',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
})

const AchievementType = sequelize.define('achieve_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.INTEGER },
})

const AchievementTypeAttribute = sequelize.define('achieve_type_attribute', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false },
    dataType: {type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'ENUM')},
    isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
    enumValues: {type: DataTypes.JSON, allowNull: true}
})

const AchievementAttributeValue = sequelize.define('achieve_attribute_value', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING }
})

const Achievement = sequelize.define('achieve', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    date: { type: DataTypes.DATEONLY },
    createdBy: { type: DataTypes.INTEGER },
})

const KPI_type = sequelize.define('kpi_type', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    calculationType: {type: DataTypes.ENUM('SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'DEF')}, // вычисляться может по какому то правилу или def - вручную
    sourceAchieveTypeId: {type: DataTypes.INTEGER},
    sourceAtributeName: {type: DataTypes.STRING},
    period: {type: DataTypes.ENUM('DAY', 'WEEK', 'MOUNTH', 'YEAR', 'NONE')},
    numType: { type: DataTypes.INTEGER, allowNull: false },
    maxValue: { type: DataTypes.INTEGER },
    createdBy: { type: DataTypes.INTEGER }
}, {timestamps: true})

const KPI_value = sequelize.define('kpi_value', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    isLast: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    value: { type: DataTypes.FLOAT, allowNull: false },
    startDate: {type: DataTypes.DATEONLY},
    endDate: {type: DataTypes.DATEONLY},
    description: { type: DataTypes.TEXT }
})

const UserReport = sequelize.define('user_report', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: {type: DataTypes.INTEGER, allowNull: false },
    filePath: {type: DataTypes.TEXT, allowNull: false},
    date: {type: DataTypes.DATE}
})

Company.hasMany(User)  
User.belongsTo(Company) 

User.hasMany(KPI_value)
KPI_value.belongsTo(User)

User.hasMany(Achievement)
Achievement.belongsTo(User)

AchievementType.hasMany(Achievement)
Achievement.belongsTo(AchievementType)

Company.hasMany(AchievementType)
AchievementType.belongsTo(Company)

AchievementType.hasMany(AchievementTypeAttribute)
AchievementTypeAttribute.belongsTo(AchievementType)

Achievement.hasMany(AchievementAttributeValue)
AchievementAttributeValue.belongsTo(Achievement)

AchievementTypeAttribute.hasMany(AchievementAttributeValue)
AchievementAttributeValue.belongsTo(AchievementTypeAttribute)

Company.hasMany(KPI_type)
KPI_type.belongsTo(Company)

KPI_type.hasMany(KPI_value)
KPI_value.belongsTo(KPI_type)

KPI_type.belongsTo(AchievementType)

User.hasMany(UserReport)
UserReport.belongsTo(User)

module.exports = {
    User,
    Company, 
    AchievementType,
    AchievementTypeAttribute,
    AchievementAttributeValue,
    Achievement,
    KPI_type,
    KPI_value,
    UserReport
}   