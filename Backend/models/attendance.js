const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Attendance = sequelize.define(
    "Attendance",
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
      clock_in: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      clock_out: {
        type: DataTypes.DATE,
      },
      working_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "half-day", "late", "on-leave"),
        defaultValue: "present",
      },
      clock_in_ip: {
        type: DataTypes.STRING(45),
      },
      clock_out_ip: {
        type: DataTypes.STRING(45),
      },
      clock_in_location: {
        type: DataTypes.STRING(255),
      },
      clock_out_location: {
        type: DataTypes.STRING(255),
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "attendance",
      indexes: [
        { unique: true, fields: ["employee_id", "date"] },
        { fields: ["employee_id"] },
        { fields: ["date"] },
        { fields: ["status"] },
        { fields: ["deleted_at"] },
      ],
    },
  )

  return Attendance
}
