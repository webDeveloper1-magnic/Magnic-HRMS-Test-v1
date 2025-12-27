const express = require("express")
const { body } = require("express-validator")
const attendanceController = require("../controllers/attendance.controller")
const { authenticate, isAdmin } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const clockInValidation = [body("location").optional().isString(), validate]

const clockOutValidation = [body("location").optional().isString(), validate]

// Employee routes
router.post("/clock-in", authenticate, clockInValidation, attendanceController.clockIn)
router.post("/clock-out", authenticate, clockOutValidation, attendanceController.clockOut)
router.get("/today", authenticate, attendanceController.getTodayAttendance)
router.get("/history", authenticate, attendanceController.getAttendanceHistory)

// Admin routes
router.get("/all", authenticate, isAdmin, attendanceController.getAllAttendance)
router.get("/monthly-report", authenticate, isAdmin, attendanceController.getMonthlyReport)

module.exports = router
