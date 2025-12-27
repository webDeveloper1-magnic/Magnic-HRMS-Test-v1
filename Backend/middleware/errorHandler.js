// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  const error = { ...err }
  error.message = err.message
  error.statusCode = err.statusCode || 500

  // Log error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(err)
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => e.message)
    error.message = errors.join(", ")
    error.statusCode = 400
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    error.message = "Duplicate field value entered"
    error.statusCode = 400
  }

  // Sequelize foreign key constraint error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    error.message = "Invalid reference to related resource"
    error.statusCode = 400
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token"
    error.statusCode = 401
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired"
    error.statusCode = 401
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = { AppError, errorHandler }
