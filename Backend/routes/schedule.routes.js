const express = require("express")
const { body } = require("express-validator")
const scheduleController = require("../controllers/schedule.controller")
const { authenticate, isAdmin } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const createScheduleValidation = [
  body("employee_id").isInt().withMessage("Employee ID is required"),
  body("shift_type_id").isInt().withMessage("Shift type ID is required"),
  body("date").isDate().withMessage("Valid date is required"),
  body("is_holiday").optional().isBoolean(),
  body("notes").optional().isString(),
  validate,
]

const createHolidayValidation = [
  body("name").notEmpty().withMessage("Holiday name is required"),
  body("date").isDate().withMessage("Valid date is required"),
  body("type").optional().isIn(["public", "optional", "regional"]).withMessage("Invalid holiday type"),
  body("description").optional().isString(),
  validate,
]

// Employee routes
router.get("/my-schedule", authenticate, scheduleController.getMySchedule)

// Admin routes - Schedules
router.post("/", authenticate, isAdmin, createScheduleValidation, scheduleController.createSchedule)
router.get("/", authenticate, isAdmin, scheduleController.getAllSchedules)
router.put("/:id", authenticate, isAdmin, scheduleController.updateSchedule)
router.delete("/:id", authenticate, isAdmin, scheduleController.deleteSchedule)

// Admin routes - Holidays
router.post("/holidays", authenticate, isAdmin, createHolidayValidation, scheduleController.createHoliday)
router.get("/holidays", authenticate, scheduleController.getHolidays)
router.put("/holidays/:id", authenticate, isAdmin, scheduleController.updateHoliday)
router.delete("/holidays/:id", authenticate, isAdmin, scheduleController.deleteHoliday)

module.exports = router
