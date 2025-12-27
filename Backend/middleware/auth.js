const jwt = require("jsonwebtoken")
const { User, Role, Employee } = require("../models")
const { AppError } = require("./errorHandler")

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401)
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "permissions"],
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name", "department", "designation"],
        },
      ],
    })

    if (!user) {
      throw new AppError("User not found", 401)
    }

    if (!user.is_active) {
      throw new AppError("User account is inactive", 401)
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401))
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401))
    }
    next(error)
  }
}

// Role-based authorization
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401))
    }

    const userRole = req.user.role.name

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError(`Access denied. Required role: ${allowedRoles.join(" or ")}`, 403))
    }

    next()
  }
}

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401))
  }

  const userRole = req.user.role.name
  if (!["Super Admin", "Admin"].includes(userRole)) {
    return next(new AppError("Access denied. Admin privileges required", 403))
  }

  next()
}

// Check if user can access employee resource
exports.canAccessEmployee = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401))
  }

  const userRole = req.user.role.name
  const requestedEmployeeId = Number.parseInt(req.params.id)
  const currentEmployeeId = req.user.employee?.id

  // Admin can access any employee
  if (["Super Admin", "Admin", "HR"].includes(userRole)) {
    return next()
  }

  // Employee can only access their own data
  if (requestedEmployeeId === currentEmployeeId) {
    return next()
  }

  return next(new AppError("Access denied. You can only access your own data", 403))
}
