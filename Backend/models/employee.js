const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Employee = sequelize.define(
    "Employee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      employee_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      address: {
        type: DataTypes.TEXT,
      },
      city: {
        type: DataTypes.STRING(100),
      },
      state: {
        type: DataTypes.STRING(100),
      },
      country: {
        type: DataTypes.STRING(100),
      },
      postal_code: {
        type: DataTypes.STRING(20),
      },
      department: {
        type: DataTypes.STRING(100),
      },
      designation: {
        type: DataTypes.STRING(100),
      },
      date_of_joining: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      date_of_leaving: {
        type: DataTypes.DATEONLY,
      },
      employment_type: {
        type: DataTypes.ENUM("full-time", "part-time", "contract", "intern"),
        defaultValue: "full-time",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "terminated"),
        defaultValue: "active",
      },
      salary: {
        type: DataTypes.DECIMAL(12, 2),
      },
      emergency_contact_name: {
        type: DataTypes.STRING(100),
      },
      emergency_contact_phone: {
        type: DataTypes.STRING(20),
      },
      emergency_contact_relation: {
        type: DataTypes.STRING(50),
      },
      manager_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "employees",
          key: "id",
        },
      },
    },
    {
      tableName: "employees",
      indexes: [
        { fields: ["user_id"] },
        { fields: ["employee_code"] },
        { fields: ["first_name", "last_name"] },
        { fields: ["department"] },
        { fields: ["status"] },
        { fields: ["manager_id"] },
        { fields: ["deleted_at"] },
      ],
    },
  )

  return Employee
}
