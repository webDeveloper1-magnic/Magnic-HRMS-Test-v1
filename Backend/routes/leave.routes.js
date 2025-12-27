const express = require("express")
const { body } = require("express-validator")
const leaveController = require("../controllers/leave.controller")
const { authenticate, isAdmin, authorize } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const applyLeaveValidation = [
  body("leave_type_id").isInt().withMessage("Leave type ID is required"),
  body("start_date").isDate().withMessage("Valid start date is required"),
  body("end_date").isDate().withMessage("Valid end date is required"),
  body("days").isFloat({ min: 0.5 }).withMessage("Days must be at least 0.5"),
  body("reason").notEmpty().withMessage("Reason is required"),
  validate,
]

const rejectLeaveValidation = [body("rejection_reason").optional().isString(), validate]

// Employee routes
router.post("/", authenticate, applyLeaveValidation, leaveController.applyLeave)
router.get("/my-leaves", authenticate, leaveController.getMyLeaves)
router.get("/balance", authenticate, leaveController.getLeaveBalance)
router.delete("/:id", authenticate, leaveController.cancelLeave)

// Admin routes
router.get("/", authenticate, authorize("Admin", "Super Admin", "Manager", "HR"), leaveController.getAllLeaves)
router.get("/:id", authenticate, leaveController.getLeave)
router.put("/:id/approve", authenticate, authorize("Admin", "Super Admin", "Manager"), leaveController.approveLeave)
router.put(
  "/:id/reject",
  authenticate,
  authorize("Admin", "Super Admin", "Manager"),
  rejectLeaveValidation,
  leaveController.rejectLeave,
)

module.exports = router
