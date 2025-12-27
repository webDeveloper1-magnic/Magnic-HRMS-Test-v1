const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const ShiftType = sequelize.define(
    "ShiftType",
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
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      working_hours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
      },
      grace_period_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 15,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "shift_types",
      indexes: [{ fields: ["name"] }, { fields: ["deleted_at"] }],
    },
  )

  return ShiftType
}
