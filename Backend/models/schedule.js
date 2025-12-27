const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Schedule = sequelize.define(
    "Schedule",
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
      shift_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "shift_types",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "schedules",
      indexes: [
        { unique: true, fields: ["employee_id", "date"] },
        { fields: ["employee_id"] },
        { fields: ["date"] },
        { fields: ["deleted_at"] },
      ],
    },
  )

  return Schedule
}
