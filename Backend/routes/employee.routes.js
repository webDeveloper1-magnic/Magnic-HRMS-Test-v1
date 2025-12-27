const express = require("express")
const { body } = require("express-validator")
const employeeController = require("../controllers/employee.controller")
const { authenticate, isAdmin, canAccessEmployee } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const createEmployeeValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("employee_code").notEmpty().withMessage("Employee code is required"),
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("date_of_joining").isDate().withMessage("Valid date of joining is required"),
  body("department").optional().isString(),
  body("designation").optional().isString(),
  validate,
]

// Employee self-service routes
router.get("/me", authenticate, employeeController.getMyProfile)
router.put("/me", authenticate, employeeController.updateMyProfile)

// Admin routes
router.post("/", authenticate, isAdmin, createEmployeeValidation, employeeController.createEmployee)
router.get("/", authenticate, isAdmin, employeeController.getEmployees)
router.get("/:id", authenticate, canAccessEmployee, employeeController.getEmployee)
router.put("/:id", authenticate, isAdmin, employeeController.updateEmployee)
router.delete("/:id", authenticate, isAdmin, employeeController.deleteEmployee)

module.exports = router
