require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { sequelize } = require("./models")

// Import routes
const authRoutes = require("./routes/auth.routes")
const employeeRoutes = require("./routes/employee.routes")
const attendanceRoutes = require("./routes/attendance.routes")
const leaveRoutes = require("./routes/leave.routes")
const permissionRoutes = require("./routes/permission.routes")
const expenseRoutes = require("./routes/expense.routes")
const scheduleRoutes = require("./routes/schedule.routes")
const roleRoutes = require("./routes/role.routes")

// Import middleware
const { errorHandler } = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "HRMS API is running" })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/leaves", leaveRoutes)
app.use("/api/permissions", permissionRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/schedules", scheduleRoutes)
app.use("/api/roles", roleRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Sync database (use with caution in production)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false })
      console.log("Database synchronized.")
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
    process.exit(1)
  }
}

startServer()
