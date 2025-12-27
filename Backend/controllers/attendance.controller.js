const { Attendance, Employee, User } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")

// Clock in
exports.clockIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { location, notes } = req.body
    const today = new Date().toISOString().split("T")[0]

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id: employeeId,
        date: today,
      },
    })

    if (existingAttendance) {
      throw new AppError("Already clocked in today", 400)
    }

    // Get IP address
    const ip = req.ip || req.connection.remoteAddress

    // Create attendance record
    const attendance = await Attendance.create({
      employee_id: employeeId,
      date: today,
      clock_in: new Date(),
      clock_in_ip: ip,
      clock_in_location: location,
      notes,
      status: "present",
    })

    return successResponse(res, "Clocked in successfully", { attendance }, 201)
  } catch (error) {
    next(error)
  }
}

// Clock out
exports.clockOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { location } = req.body
    const today = new Date().toISOString().split("T")[0]

    // Find today's attendance
    const attendance = await Attendance.findOne({
      where: {
        employee_id: employeeId,
        date: today,
      },
    })

    if (!attendance) {
      throw new AppError("No clock-in record found for today", 400)
    }

    if (attendance.clock_out) {
      throw new AppError("Already clocked out today", 400)
    }

    // Get IP address
    const ip = req.ip || req.connection.remoteAddress
    const clockOut = new Date()

    // Calculate working hours
    const clockIn = new Date(attendance.clock_in)
    const workingHours = (clockOut - clockIn) / (1000 * 60 * 60) // Convert to hours

    // Update attendance
    await attendance.update({
      clock_out: clockOut,
      clock_out_ip: ip,
      clock_out_location: location,
      working_hours: workingHours.toFixed(2),
    })

    return successResponse(res, "Clocked out successfully", { attendance })
  } catch (error) {
    next(error)
  }
}

// Get today's attendance
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const today = new Date().toISOString().split("T")[0]

    const attendance = await Attendance.findOne({
      where: {
        employee_id: employeeId,
        date: today,
      },
    })

    return successResponse(res, "Today's attendance retrieved successfully", { attendance })
  } catch (error) {
    next(error)
  }
}

// Get attendance history
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id
    const { page = 1, limit = 10, start_date, end_date } = req.query

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = { employee_id: employeeId }

    // Date range filter
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date],
      }
    } else if (start_date) {
      whereClause.date = {
        [Op.gte]: start_date,
      }
    } else if (end_date) {
      whereClause.date = {
        [Op.lte]: end_date,
      }
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      order: [["date", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Attendance history retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get all attendance (Admin)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employee_id, start_date, end_date, status } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = {}

    if (employee_id) {
      whereClause.employee_id = employee_id
    }

    if (status) {
      whereClause.status = status
    }

    // Date range filter
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date],
      }
    } else if (start_date) {
      whereClause.date = {
        [Op.gte]: start_date,
      }
    } else if (end_date) {
      whereClause.date = {
        [Op.lte]: end_date,
      }
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name", "department"],
        },
      ],
      order: [["date", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Attendance records retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get monthly attendance report
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { employee_id, year, month } = req.query

    if (!employee_id || !year || !month) {
      throw new AppError("employee_id, year, and month are required", 400)
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const attendances = await Attendance.findAll({
      where: {
        employee_id,
        date: {
          [Op.between]: [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]],
        },
      },
      order: [["date", "ASC"]],
    })

    // Calculate summary
    const totalDays = attendances.length
    const totalWorkingHours = attendances.reduce((sum, att) => sum + Number.parseFloat(att.working_hours || 0), 0)
    const presentDays = attendances.filter((att) => att.status === "present").length
    const lateDays = attendances.filter((att) => att.status === "late").length
    const halfDays = attendances.filter((att) => att.status === "half-day").length

    const report = {
      employee_id,
      year: Number.parseInt(year),
      month: Number.parseInt(month),
      summary: {
        totalDays,
        presentDays,
        lateDays,
        halfDays,
        totalWorkingHours: totalWorkingHours.toFixed(2),
        averageWorkingHours: totalDays > 0 ? (totalWorkingHours / totalDays).toFixed(2) : 0,
      },
      attendances,
    }

    return successResponse(res, "Monthly attendance report retrieved successfully", report)
  } catch (error) {
    next(error)
  }
}
