require("dotenv").config()
const { sequelize, Role, User, Employee, LeaveType, LeaveBalance, ExpenseCategory, ShiftType } = require("../models")

const seedDatabase = async () => {
  try {
    console.log("Starting database seed...")

    // Sync database
    await sequelize.sync({ force: true })
    console.log("Database synchronized")

    // Seed Roles
    console.log("Seeding roles...")
    const roles = await Role.bulkCreate([
      {
        name: "Super Admin",
        description: "Full system access",
        permissions: ["all"],
      },
      {
        name: "Admin",
        description: "Administrative access",
        permissions: ["employees.manage", "leaves.approve", "expenses.approve", "attendance.view"],
      },
      {
        name: "Manager",
        description: "Team management access",
        permissions: ["leaves.approve", "expenses.approve", "attendance.view"],
      },
      {
        name: "HR",
        description: "HR management access",
        permissions: ["employees.manage", "leaves.view", "attendance.view"],
      },
      {
        name: "Employee",
        description: "Employee self-service",
        permissions: ["profile.view", "attendance.self", "leaves.apply", "expenses.submit"],
      },
    ])
    console.log(`✓ Created ${roles.length} roles`)

    // Seed Leave Types
    console.log("Seeding leave types...")
    const leaveTypes = await LeaveType.bulkCreate([
      {
        name: "Annual Leave",
        days_per_year: 20,
        is_paid: true,
        requires_approval: true,
        description: "Annual paid leave",
      },
      {
        name: "Sick Leave",
        days_per_year: 10,
        is_paid: true,
        requires_approval: true,
        description: "Medical sick leave",
      },
      {
        name: "Casual Leave",
        days_per_year: 5,
        is_paid: true,
        requires_approval: true,
        description: "Casual leave for personal matters",
      },
      {
        name: "Unpaid Leave",
        days_per_year: 0,
        is_paid: false,
        requires_approval: true,
        description: "Leave without pay",
      },
      {
        name: "Maternity Leave",
        days_per_year: 90,
        is_paid: true,
        requires_approval: true,
        description: "Maternity leave for female employees",
      },
      {
        name: "Paternity Leave",
        days_per_year: 10,
        is_paid: true,
        requires_approval: true,
        description: "Paternity leave for male employees",
      },
    ])
    console.log(`✓ Created ${leaveTypes.length} leave types`)

    // Seed Expense Categories
    console.log("Seeding expense categories...")
    const expenseCategories = await ExpenseCategory.bulkCreate([
      {
        name: "Travel",
        description: "Travel expenses including transport",
        requires_proof: true,
      },
      {
        name: "Food",
        description: "Food and meal expenses during work",
        requires_proof: true,
      },
      {
        name: "Accommodation",
        description: "Hotel and lodging expenses",
        requires_proof: true,
      },
      {
        name: "Office Supplies",
        description: "Office supplies and equipment",
        requires_proof: true,
      },
      {
        name: "Communication",
        description: "Phone and internet expenses",
        requires_proof: false,
      },
      {
        name: "Training",
        description: "Training and development expenses",
        requires_proof: true,
      },
      {
        name: "Other",
        description: "Miscellaneous expenses",
        requires_proof: true,
      },
    ])
    console.log(`✓ Created ${expenseCategories.length} expense categories`)

    // Seed Shift Types
    console.log("Seeding shift types...")
    const shiftTypes = await ShiftType.bulkCreate([
      {
        name: "Morning Shift",
        start_time: "09:00:00",
        end_time: "18:00:00",
        working_hours: 8,
        grace_period_minutes: 15,
      },
      {
        name: "Evening Shift",
        start_time: "14:00:00",
        end_time: "23:00:00",
        working_hours: 8,
        grace_period_minutes: 15,
      },
      {
        name: "Night Shift",
        start_time: "22:00:00",
        end_time: "07:00:00",
        working_hours: 8,
        grace_period_minutes: 15,
      },
      {
        name: "Flexible",
        start_time: "00:00:00",
        end_time: "23:59:59",
        working_hours: 8,
        grace_period_minutes: 30,
      },
    ])
    console.log(`✓ Created ${shiftTypes.length} shift types`)

    // Create Admin User
    console.log("Creating admin user...")
    const adminRole = roles.find((r) => r.name === "Admin")
    const adminUser = await User.create({
      email: "admin@hrms.com",
      password: "Admin@123",
      role_id: adminRole.id,
      is_active: true,
    })

    await Employee.create({
      user_id: adminUser.id,
      employee_code: "EMP001",
      first_name: "Admin",
      last_name: "User",
      date_of_joining: "2024-01-01",
      department: "Management",
      designation: "System Administrator",
      phone: "+1234567890",
      employment_type: "full-time",
      status: "active",
    })
    console.log("✓ Created admin user (admin@hrms.com / Admin@123)")

    // Create Employee User
    console.log("Creating employee user...")
    const employeeRole = roles.find((r) => r.name === "Employee")
    const employeeUser = await User.create({
      email: "employee@hrms.com",
      password: "Employee@123",
      role_id: employeeRole.id,
      is_active: true,
    })

    const employee = await Employee.create({
      user_id: employeeUser.id,
      employee_code: "EMP002",
      first_name: "John",
      last_name: "Doe",
      date_of_joining: "2024-01-15",
      department: "Engineering",
      designation: "Software Engineer",
      phone: "+1234567891",
      employment_type: "full-time",
      status: "active",
    })
    console.log("✓ Created employee user (employee@hrms.com / Employee@123)")

    // Create Leave Balances for Employee
    console.log("Creating leave balances...")
    const currentYear = new Date().getFullYear()
    const leaveBalances = []

    for (const leaveType of leaveTypes) {
      if (leaveType.days_per_year > 0) {
        leaveBalances.push({
          employee_id: employee.id,
          leave_type_id: leaveType.id,
          year: currentYear,
          total_days: leaveType.days_per_year,
          used_days: 0,
          remaining_days: leaveType.days_per_year,
        })
      }
    }

    await LeaveBalance.bulkCreate(leaveBalances)
    console.log(`✓ Created ${leaveBalances.length} leave balances`)

    console.log("\n✅ Database seeded successfully!")
    console.log("\nTest Credentials:")
    console.log("Admin: admin@hrms.com / Admin@123")
    console.log("Employee: employee@hrms.com / Employee@123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
