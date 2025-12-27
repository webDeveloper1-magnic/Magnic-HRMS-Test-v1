const { Sequelize } = require("sequelize")
const config = require("../config/database")

// Initialize Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: config.logging,
  pool: config.pool,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete
  },
})

// Import models
const Role = require("./role")(sequelize)
const User = require("./user")(sequelize)
const Employee = require("./employee")(sequelize)
const Attendance = require("./attendance")(sequelize)
const LeaveType = require("./leaveType")(sequelize)
const LeaveBalance = require("./leaveBalance")(sequelize)
const Leave = require("./leave")(sequelize)
const Permission = require("./permission")(sequelize)
const ExpenseCategory = require("./expenseCategory")(sequelize)
const Expense = require("./expense")(sequelize)
const ShiftType = require("./shiftType")(sequelize)
const Schedule = require("./schedule")(sequelize)
const Holiday = require("./holiday")(sequelize)
const RefreshToken = require("./refreshToken")(sequelize)

// Define associations
const db = {
  sequelize,
  Sequelize,
  Role,
  User,
  Employee,
  Attendance,
  LeaveType,
  LeaveBalance,
  Leave,
  Permission,
  ExpenseCategory,
  Expense,
  ShiftType,
  Schedule,
  Holiday,
  RefreshToken,
}

// ============================================
// ASSOCIATIONS
// ============================================

// Role <-> User (1:M)
Role.hasMany(User, { foreignKey: "role_id", as: "users" })
User.belongsTo(Role, { foreignKey: "role_id", as: "role" })

// User <-> Employee (1:1)
User.hasOne(Employee, { foreignKey: "user_id", as: "employee" })
Employee.belongsTo(User, { foreignKey: "user_id", as: "user" })

// Employee self-referencing (Manager hierarchy)
Employee.belongsTo(Employee, { foreignKey: "manager_id", as: "manager" })
Employee.hasMany(Employee, { foreignKey: "manager_id", as: "subordinates" })

// Employee <-> Attendance (1:M)
Employee.hasMany(Attendance, { foreignKey: "employee_id", as: "attendances" })
Attendance.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// LeaveType <-> Leave (1:M)
LeaveType.hasMany(Leave, { foreignKey: "leave_type_id", as: "leaves" })
Leave.belongsTo(LeaveType, { foreignKey: "leave_type_id", as: "leaveType" })

// LeaveType <-> LeaveBalance (1:M)
LeaveType.hasMany(LeaveBalance, { foreignKey: "leave_type_id", as: "balances" })
LeaveBalance.belongsTo(LeaveType, { foreignKey: "leave_type_id", as: "leaveType" })

// Employee <-> Leave (1:M)
Employee.hasMany(Leave, { foreignKey: "employee_id", as: "leaves" })
Leave.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// User <-> Leave (Approver) (1:M)
User.hasMany(Leave, { foreignKey: "approved_by", as: "approvedLeaves" })
Leave.belongsTo(User, { foreignKey: "approved_by", as: "approver" })

// Employee <-> LeaveBalance (1:M)
Employee.hasMany(LeaveBalance, { foreignKey: "employee_id", as: "leaveBalances" })
LeaveBalance.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// Employee <-> Permission (1:M)
Employee.hasMany(Permission, { foreignKey: "employee_id", as: "permissions" })
Permission.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// User <-> Permission (Approver) (1:M)
User.hasMany(Permission, { foreignKey: "approved_by", as: "approvedPermissions" })
Permission.belongsTo(User, { foreignKey: "approved_by", as: "approver" })

// ExpenseCategory <-> Expense (1:M)
ExpenseCategory.hasMany(Expense, { foreignKey: "category_id", as: "expenses" })
Expense.belongsTo(ExpenseCategory, { foreignKey: "category_id", as: "category" })

// Employee <-> Expense (1:M)
Employee.hasMany(Expense, { foreignKey: "employee_id", as: "expenses" })
Expense.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// User <-> Expense (Approver) (1:M)
User.hasMany(Expense, { foreignKey: "approved_by", as: "approvedExpenses" })
Expense.belongsTo(User, { foreignKey: "approved_by", as: "approver" })

// ShiftType <-> Schedule (1:M)
ShiftType.hasMany(Schedule, { foreignKey: "shift_type_id", as: "schedules" })
Schedule.belongsTo(ShiftType, { foreignKey: "shift_type_id", as: "shiftType" })

// Employee <-> Schedule (1:M)
Employee.hasMany(Schedule, { foreignKey: "employee_id", as: "schedules" })
Schedule.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" })

// User <-> RefreshToken (1:M)
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" })
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" })

module.exports = db
