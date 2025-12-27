const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Expense = sequelize.define(
    "Expense",
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
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "expense_categories",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      receipt_url: {
        type: DataTypes.STRING(500),
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "paid"),
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
      paid_at: {
        type: DataTypes.DATE,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "expenses",
      indexes: [{ fields: ["employee_id"] }, { fields: ["status"] }, { fields: ["date"] }, { fields: ["deleted_at"] }],
    },
  )

  return Expense
}
