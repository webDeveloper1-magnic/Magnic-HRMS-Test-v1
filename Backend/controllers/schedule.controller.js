const { Schedule, ShiftType, Employee, Holiday } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")

// Create schedule
exports.createSchedule = async (req, res, next) => {
  try {
    const { employee_id, shift_type_id, date, is_holiday, notes } = req.body

    // Validate employee
    const employee = await Employee.findByPk(employee_id)
    if (!employee) {
      throw new AppError("Employee not found", 404)
    }

    // Validate shift type
    const shiftType = await ShiftType.findByPk(shift_type_id)
    if (!shiftType) {
      throw new AppError("Shift type not found", 404)
    }

    // Check if schedule already exists for this date
    const existingSchedule = await Schedule.findOne({
      where: {
        employee_id,
        date,
      },
    })

    if (existingSchedule) {
      throw new AppError("Schedule already exists for this date", 400)
    }

    // Create schedule
    const schedule = await Schedule.create({
      employee_id,
      shift_type_id,
      date,
      is_holiday: is_holiday || false,
      notes,
    })

    const scheduleData = await Schedule.findByPk(schedule.id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
        {
          model: ShiftType,
          as: "shiftType",
          attributes: ["id", "name", "start_time", "end_time", "working_hours"],
        },
      ],
    })

    return successResponse(res, "Schedule created successfully", { schedule: scheduleData }, 201)
  } catch (error) {
    next(error)
  }
}

// Get all schedules (Admin)
exports.getAllSchedules = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employee_id, start_date, end_date, shift_type_id } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = {}

    if (employee_id) {
      whereClause.employee_id = employee_id
    }

    if (shift_type_id) {
      whereClause.shift_type_id = shift_type_id
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

    const { count, rows } = await Schedule.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name", "department"],
        },
        {
          model: ShiftType,
          as: "shiftType",
          attributes: ["id", "name", "start_time", "end_time", "working_hours"],
        },
      ],
      order: [["date", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Schedules retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get my schedule (Employee)
exports.getMySchedule = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { start_date, end_date } = req.query

    const whereClause = { employee_id: employeeId }

    // Default to current month if no date range provided
    if (!start_date && !end_date) {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      whereClause.date = {
        [Op.between]: [firstDay.toISOString().split("T")[0], lastDay.toISOString().split("T")[0]],
      }
    } else if (start_date && end_date) {
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

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: [
        {
          model: ShiftType,
          as: "shiftType",
          attributes: ["id", "name", "start_time", "end_time", "working_hours"],
        },
      ],
      order: [["date", "ASC"]],
    })

    return successResponse(res, "Your schedule retrieved successfully", { schedules })
  } catch (error) {
    next(error)
  }
}

// Update schedule
exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params
    const { shift_type_id, is_holiday, notes } = req.body

    const schedule = await Schedule.findByPk(id)

    if (!schedule) {
      throw new AppError("Schedule not found", 404)
    }

    // Validate shift type if provided
    if (shift_type_id) {
      const shiftType = await ShiftType.findByPk(shift_type_id)
      if (!shiftType) {
        throw new AppError("Shift type not found", 404)
      }
    }

    await schedule.update({
      shift_type_id: shift_type_id || schedule.shift_type_id,
      is_holiday: is_holiday !== undefined ? is_holiday : schedule.is_holiday,
      notes: notes !== undefined ? notes : schedule.notes,
    })

    const updatedSchedule = await Schedule.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
        {
          model: ShiftType,
          as: "shiftType",
          attributes: ["id", "name", "start_time", "end_time", "working_hours"],
        },
      ],
    })

    return successResponse(res, "Schedule updated successfully", { schedule: updatedSchedule })
  } catch (error) {
    next(error)
  }
}

// Delete schedule
exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params

    const schedule = await Schedule.findByPk(id)

    if (!schedule) {
      throw new AppError("Schedule not found", 404)
    }

    await schedule.destroy()

    return successResponse(res, "Schedule deleted successfully")
  } catch (error) {
    next(error)
  }
}

// Create holiday
exports.createHoliday = async (req, res, next) => {
  try {
    const { name, date, type, description } = req.body

    // Check if holiday already exists for this date
    const existingHoliday = await Holiday.findOne({ where: { date } })

    if (existingHoliday) {
      throw new AppError("Holiday already exists for this date", 400)
    }

    const holiday = await Holiday.create({
      name,
      date,
      type: type || "public",
      description,
    })

    return successResponse(res, "Holiday created successfully", { holiday }, 201)
  } catch (error) {
    next(error)
  }
}

// Get all holidays
exports.getHolidays = async (req, res, next) => {
  try {
    const { year, type } = req.query

    const whereClause = {}

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      }
    }

    if (type) {
      whereClause.type = type
    }

    const holidays = await Holiday.findAll({
      where: whereClause,
      order: [["date", "ASC"]],
    })

    return successResponse(res, "Holidays retrieved successfully", { holidays })
  } catch (error) {
    next(error)
  }
}

// Update holiday
exports.updateHoliday = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const holiday = await Holiday.findByPk(id)

    if (!holiday) {
      throw new AppError("Holiday not found", 404)
    }

    await holiday.update(updateData)

    return successResponse(res, "Holiday updated successfully", { holiday })
  } catch (error) {
    next(error)
  }
}

// Delete holiday
exports.deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params

    const holiday = await Holiday.findByPk(id)

    if (!holiday) {
      throw new AppError("Holiday not found", 404)
    }

    await holiday.destroy()

    return successResponse(res, "Holiday deleted successfully")
  } catch (error) {
    next(error)
  }
}
