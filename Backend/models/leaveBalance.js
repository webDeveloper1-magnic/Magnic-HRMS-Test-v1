const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const LeaveBalance = sequelize.define(
    "LeaveBalance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "leave_types",
          key: "id",
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      used_days: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      remaining_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
    },
    {
      tableName: "leave_balances",
      indexes: [
        { unique: true, fields: ["employee_id", "leave_type_id", "year"] },
        { fields: ["employee_id"] },
        { fields: ["year"] },
        { fields: ["deleted_at"] },
      ],
    },
  )

  return LeaveBalance
}
