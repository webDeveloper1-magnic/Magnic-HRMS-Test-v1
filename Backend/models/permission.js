const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Permission = sequelize.define(
    "Permission",
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      duration_hours: {
        type: DataTypes.DECIMAL(4, 2),
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
      tableName: "permissions",
      indexes: [{ fields: ["employee_id"] }, { fields: ["status"] }, { fields: ["date"] }, { fields: ["deleted_at"] }],
    },
  )

  return Permission
}
