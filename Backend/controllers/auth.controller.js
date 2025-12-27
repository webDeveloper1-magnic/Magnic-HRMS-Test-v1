const { User, Role, Employee, RefreshToken } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt")
const { successResponse } = require("../utils/response")
const crypto = require("crypto")

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, role_name, employee_data } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new AppError("Email already registered", 400)
    }

    // Get role
    const role = await Role.findOne({ where: { name: role_name || "Employee" } })
    if (!role) {
      throw new AppError("Invalid role", 400)
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role_id: role.id,
    })

    // Create employee profile if data provided
    if (employee_data) {
      await Employee.create({
        user_id: user.id,
        ...employee_data,
      })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Save refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    })

    return successResponse(
      res,
      "User registered successfully",
      {
        user: {
          id: user.id,
          email: user.email,
          role: role.name,
        },
        accessToken,
        refreshToken,
      },
      201,
    )
  } catch (error) {
    next(error)
  }
}

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user with role and employee
    const user = await User.findOne({
      where: { email },
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
      throw new AppError("Invalid email or password", 401)
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError("Your account has been deactivated", 401)
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401)
    }

    // Update last login
    await user.update({ last_login: new Date() })

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Save refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    })

    return successResponse(res, "Login successful", {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        employee: user.employee,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
}

// Refresh access token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError("Refresh token required", 400)
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      throw new AppError("Invalid refresh token", 401)
    }

    // Check if token exists in database
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
    })

    if (!tokenRecord) {
      throw new AppError("Refresh token not found", 401)
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expires_at) {
      await tokenRecord.destroy()
      throw new AppError("Refresh token expired", 401)
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.id)

    return successResponse(res, "Token refreshed successfully", {
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

// Logout user
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Delete refresh token
      await RefreshToken.destroy({
        where: { token: refreshToken },
      })
    }

    return successResponse(res, "Logout successful")
  } catch (error) {
    next(error)
  }
}

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "permissions"],
        },
        {
          model: Employee,
          as: "employee",
        },
      ],
    })

    return successResponse(res, "Profile retrieved successfully", { user })
  } catch (error) {
    next(error)
  }
}

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      // Don't reveal if user exists
      return successResponse(res, "If email exists, password reset link will be sent")
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetTokenExpires,
    })

    // TODO: Send email with reset token
    // In production, you would send an email here

    return successResponse(res, "Password reset token generated", {
      resetToken, // Remove this in production
    })
  } catch (error) {
    next(error)
  }
}

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    })

    if (!user || !user.password_reset_expires || new Date() > user.password_reset_expires) {
      throw new AppError("Invalid or expired reset token", 400)
    }

    // Update password
    await user.update({
      password: newPassword,
      password_reset_token: null,
      password_reset_expires: null,
    })

    // Delete all refresh tokens for this user
    await RefreshToken.destroy({
      where: { user_id: user.id },
    })

    return successResponse(res, "Password reset successful")
  } catch (error) {
    next(error)
  }
}
