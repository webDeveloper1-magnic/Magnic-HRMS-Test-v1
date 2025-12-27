const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const LeaveType = sequelize.define(
    "LeaveType",
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
      days_per_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      requires_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "leave_types",
      indexes: [{ fields: ["name"] }, { fields: ["deleted_at"] }],
    },
  )

  return LeaveType
}
