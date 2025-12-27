const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const ExpenseCategory = sequelize.define(
    "ExpenseCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      max_amount: {
        type: DataTypes.DECIMAL(12, 2),
      },
      requires_proof: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "expense_categories",
      indexes: [{ fields: ["name"] }, { fields: ["deleted_at"] }],
    },
  )

  return ExpenseCategory
}
