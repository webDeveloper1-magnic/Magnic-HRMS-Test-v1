const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      tableName: "roles",
      indexes: [{ fields: ["name"] }, { fields: ["deleted_at"] }],
    },
  )

  return Role
}
