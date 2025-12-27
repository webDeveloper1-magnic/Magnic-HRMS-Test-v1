const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Holiday = sequelize.define(
    "Holiday",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("public", "optional", "regional"),
        defaultValue: "public",
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "holidays",
      indexes: [{ fields: ["date"] }, { fields: ["type"] }, { fields: ["deleted_at"] }],
    },
  )

  return Holiday
}
