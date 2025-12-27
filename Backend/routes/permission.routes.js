const express = require("express")
const { body } = require("express-validator")
const permissionController = require("../controllers/permission.controller")
const { authenticate, authorize } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const requestPermissionValidation = [
  body("date").isDate().withMessage("Valid date is required"),
  body("start_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid start time is required (HH:MM)"),
  body("end_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid end time is required (HH:MM)"),
  body("reason").notEmpty().withMessage("Reason is required"),
  validate,
]

const rejectPermissionValidation = [body("rejection_reason").optional().isString(), validate]

// Employee routes
router.post("/", authenticate, requestPermissionValidation, permissionController.requestPermission)
router.get("/my-permissions", authenticate, permissionController.getMyPermissions)

// Admin routes
router.get("/", authenticate, authorize("Admin", "Super Admin", "Manager"), permissionController.getAllPermissions)
router.put(
  "/:id/approve",
  authenticate,
  authorize("Admin", "Super Admin", "Manager"),
  permissionController.approvePermission,
)
router.put(
  "/:id/reject",
  authenticate,
  authorize("Admin", "Super Admin", "Manager"),
  rejectPermissionValidation,
  permissionController.rejectPermission,
)

module.exports = router
