const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Leave = sequelize.define(
    "Leave",
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
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
        defaultValue: "pending",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      approved_at: {
        type: DataTypes.DATE,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "leaves",
      indexes: [
        { fields: ["employee_id"] },
        { fields: ["status"] },
        { fields: ["start_date", "end_date"] },
        { fields: ["deleted_at"] },
      ],
    },
  )

  return Leave
}
