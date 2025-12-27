const { Leave, LeaveType, LeaveBalance, Employee, User } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")
const { sequelize } = require("../models")

// Apply for leave
exports.applyLeave = async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { leave_type_id, start_date, end_date, days, reason } = req.body

    // Validate leave type
    const leaveType = await LeaveType.findByPk(leave_type_id)
    if (!leaveType) {
      throw new AppError("Invalid leave type", 400)
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      where: {
        employee_id: employeeId,
        status: { [Op.in]: ["pending", "approved"] },
        [Op.or]: [
          {
            start_date: { [Op.between]: [start_date, end_date] },
          },
          {
            end_date: { [Op.between]: [start_date, end_date] },
          },
          {
            [Op.and]: [{ start_date: { [Op.lte]: start_date } }, { end_date: { [Op.gte]: end_date } }],
          },
        ],
      },
    })

    if (overlappingLeave) {
      throw new AppError("Leave dates overlap with existing leave request", 400)
    }

    // Check leave balance
    const currentYear = new Date().getFullYear()
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employee_id: employeeId,
        leave_type_id,
        year: currentYear,
      },
    })

    if (!leaveBalance) {
      throw new AppError("Leave balance not found for current year", 404)
    }

    if (leaveBalance.remaining_days < days) {
      throw new AppError(`Insufficient leave balance. Available: ${leaveBalance.remaining_days} days`, 400)
    }

    // Create leave request
    const leave = await Leave.create(
      {
        employee_id: employeeId,
        leave_type_id,
        start_date,
        end_date,
        days,
        reason,
        status: "pending",
      },
      { transaction },
    )

    await transaction.commit()

    // Fetch complete leave data
    const leaveData = await Leave.findByPk(leave.id, {
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["id", "name", "is_paid"],
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Leave applied successfully", { leave: leaveData }, 201)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// Get all leaves (Admin)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, employee_id, leave_type_id } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = {}

    if (status) {
      whereClause.status = status
    }

    if (employee_id) {
      whereClause.employee_id = employee_id
    }

    if (leave_type_id) {
      whereClause.leave_type_id = leave_type_id
    }

    const { count, rows } = await Leave.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["id", "name", "is_paid"],
        },
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

    return paginatedResponse(res, "Leaves retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get my leaves (Employee)
exports.getMyLeaves = async (req, res, next) => {
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

    const { count, rows } = await Leave.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["id", "name", "is_paid"],
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

    return paginatedResponse(res, "Your leaves retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get single leave
exports.getLeave = async (req, res, next) => {
  try {
    const { id } = req.params

    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: LeaveType,
          as: "leaveType",
        },
        {
          model: Employee,
          as: "employee",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["email"],
            },
          ],
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
    })

    if (!leave) {
      throw new AppError("Leave not found", 404)
    }

    // Check access permission (admin or own leave)
    const userRole = req.user.role.name
    const isOwner = leave.employee_id === req.user.employee?.id

    if (!["Super Admin", "Admin", "Manager", "HR"].includes(userRole) && !isOwner) {
      throw new AppError("Access denied", 403)
    }

    return successResponse(res, "Leave retrieved successfully", { leave })
  } catch (error) {
    next(error)
  }
}

// Approve leave
exports.approveLeave = async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: LeaveType,
          as: "leaveType",
        },
      ],
    })

    if (!leave) {
      throw new AppError("Leave not found", 404)
    }

    if (leave.status !== "pending") {
      throw new AppError(`Leave is already ${leave.status}`, 400)
    }

    // Update leave balance
    const currentYear = new Date().getFullYear()
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employee_id: leave.employee_id,
        leave_type_id: leave.leave_type_id,
        year: currentYear,
      },
      transaction,
    })

    if (!leaveBalance) {
      throw new AppError("Leave balance not found", 404)
    }

    if (leaveBalance.remaining_days < leave.days) {
      throw new AppError("Insufficient leave balance", 400)
    }

    // Deduct leave balance
    await leaveBalance.update(
      {
        used_days: Number.parseFloat(leaveBalance.used_days) + Number.parseFloat(leave.days),
        remaining_days: Number.parseFloat(leaveBalance.remaining_days) - Number.parseFloat(leave.days),
      },
      { transaction },
    )

    // Update leave status
    await leave.update(
      {
        status: "approved",
        approved_by: req.user.id,
        approved_at: new Date(),
      },
      { transaction },
    )

    await transaction.commit()

    const updatedLeave = await Leave.findByPk(id, {
      include: [
        {
          model: LeaveType,
          as: "leaveType",
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Leave approved successfully", { leave: updatedLeave })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// Reject leave
exports.rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rejection_reason } = req.body

    const leave = await Leave.findByPk(id)

    if (!leave) {
      throw new AppError("Leave not found", 404)
    }

    if (leave.status !== "pending") {
      throw new AppError(`Leave is already ${leave.status}`, 400)
    }

    await leave.update({
      status: "rejected",
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason,
    })

    const updatedLeave = await Leave.findByPk(id, {
      include: [
        {
          model: LeaveType,
          as: "leaveType",
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Leave rejected successfully", { leave: updatedLeave })
  } catch (error) {
    next(error)
  }
}

// Cancel leave (Employee)
exports.cancelLeave = async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const employeeId = req.user.employee?.id

    const leave = await Leave.findByPk(id, { transaction })

    if (!leave) {
      throw new AppError("Leave not found", 404)
    }

    if (leave.employee_id !== employeeId) {
      throw new AppError("Access denied", 403)
    }

    if (leave.status !== "pending" && leave.status !== "approved") {
      throw new AppError("Only pending or approved leaves can be cancelled", 400)
    }

    // If leave was approved, restore balance
    if (leave.status === "approved") {
      const currentYear = new Date().getFullYear()
      const leaveBalance = await LeaveBalance.findOne({
        where: {
          employee_id: leave.employee_id,
          leave_type_id: leave.leave_type_id,
          year: currentYear,
        },
        transaction,
      })

      if (leaveBalance) {
        await leaveBalance.update(
          {
            used_days: Number.parseFloat(leaveBalance.used_days) - Number.parseFloat(leave.days),
            remaining_days: Number.parseFloat(leaveBalance.remaining_days) + Number.parseFloat(leave.days),
          },
          { transaction },
        )
      }
    }

    await leave.update({ status: "cancelled" }, { transaction })

    await transaction.commit()

    return successResponse(res, "Leave cancelled successfully", { leave })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// Get leave balance
exports.getLeaveBalance = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const currentYear = new Date().getFullYear()

    const balances = await LeaveBalance.findAll({
      where: {
        employee_id: employeeId,
        year: currentYear,
      },
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["id", "name", "is_paid"],
        },
      ],
    })

    return successResponse(res, "Leave balance retrieved successfully", { balances, year: currentYear })
  } catch (error) {
    next(error)
  }
}
