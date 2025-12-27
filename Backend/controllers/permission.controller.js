const { Permission, Employee, User } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")

// Request permission
exports.requestPermission = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { date, start_time, end_time, reason } = req.body

    // Calculate duration in hours
    const startTime = new Date(`2000-01-01 ${start_time}`)
    const endTime = new Date(`2000-01-01 ${end_time}`)
    const durationHours = (endTime - startTime) / (1000 * 60 * 60)

    if (durationHours <= 0) {
      throw new AppError("End time must be after start time", 400)
    }

    if (durationHours > 4) {
      throw new AppError("Permission cannot exceed 4 hours", 400)
    }

    // Check for overlapping permissions
    const overlappingPermission = await Permission.findOne({
      where: {
        employee_id: employeeId,
        date,
        status: { [Op.in]: ["pending", "approved"] },
        [Op.or]: [
          {
            start_time: { [Op.between]: [start_time, end_time] },
          },
          {
            end_time: { [Op.between]: [start_time, end_time] },
          },
          {
            [Op.and]: [{ start_time: { [Op.lte]: start_time } }, { end_time: { [Op.gte]: end_time } }],
          },
        ],
      },
    })

    if (overlappingPermission) {
      throw new AppError("Permission time overlaps with existing permission", 400)
    }

    // Auto-approve if duration is less than 2 hours
    const status = durationHours < 2 ? "approved" : "pending"
    const approved_by = durationHours < 2 ? req.user.id : null
    const approved_at = durationHours < 2 ? new Date() : null

    // Create permission request
    const permission = await Permission.create({
      employee_id: employeeId,
      date,
      start_time,
      end_time,
      duration_hours: durationHours.toFixed(2),
      reason,
      status,
      approved_by,
      approved_at,
    })

    const permissionData = await Permission.findByPk(permission.id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(
      res,
      status === "approved" ? "Permission auto-approved" : "Permission requested successfully",
      { permission: permissionData },
      201,
    )
  } catch (error) {
    next(error)
  }
}

// Get all permissions (Admin)
exports.getAllPermissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, employee_id, date } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = {}

    if (status) {
      whereClause.status = status
    }

    if (employee_id) {
      whereClause.employee_id = employee_id
    }

    if (date) {
      whereClause.date = date
    }

    const { count, rows } = await Permission.findAndCountAll({
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
          model: User,
          as: "approver",
          attributes: ["id", "email"],
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Permissions retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get my permissions (Employee)
exports.getMyPermissions = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { page = 1, limit = 10, status } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = { employee_id: employeeId }

    if (status) {
      whereClause.status = status
    }

    const { count, rows } = await Permission.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: User,
          as: "approver",
          attributes: ["id", "email"],
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Your permissions retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Approve permission
exports.approvePermission = async (req, res, next) => {
  try {
    const { id } = req.params

    const permission = await Permission.findByPk(id)

    if (!permission) {
      throw new AppError("Permission not found", 404)
    }

    if (permission.status !== "pending") {
      throw new AppError(`Permission is already ${permission.status}`, 400)
    }

    await permission.update({
      status: "approved",
      approved_by: req.user.id,
      approved_at: new Date(),
    })

    const updatedPermission = await Permission.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Permission approved successfully", { permission: updatedPermission })
  } catch (error) {
    next(error)
  }
}

// Reject permission
exports.rejectPermission = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rejection_reason } = req.body

    const permission = await Permission.findByPk(id)

    if (!permission) {
      throw new AppError("Permission not found", 404)
    }

    if (permission.status !== "pending") {
      throw new AppError(`Permission is already ${permission.status}`, 400)
    }

    await permission.update({
      status: "rejected",
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason,
    })

    const updatedPermission = await Permission.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Permission rejected successfully", { permission: updatedPermission })
  } catch (error) {
    next(error)
  }
}
