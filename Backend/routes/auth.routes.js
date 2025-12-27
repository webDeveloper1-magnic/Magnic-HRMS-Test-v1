const express = require("express")
const { body } = require("express-validator")
const authController = require("../controllers/auth.controller")
const { authenticate } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("role_name").optional().isString().withMessage("Role name must be a string"),
  validate,
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
]

const refreshTokenValidation = [body("refreshToken").notEmpty().withMessage("Refresh token is required"), validate]

const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  validate,
]

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  validate,
]

// Routes
router.post("/register", registerValidation, authController.register)
router.post("/login", loginValidation, authController.login)
router.post("/refresh", refreshTokenValidation, authController.refreshToken)
router.post("/logout", authController.logout)
router.get("/profile", authenticate, authController.getProfile)
router.post("/forgot-password", forgotPasswordValidation, authController.forgotPassword)
router.post("/reset-password", resetPasswordValidation, authController.resetPassword)

module.exports = router
