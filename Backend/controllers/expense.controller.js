const { Expense, ExpenseCategory, Employee, User } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")

// Submit expense
exports.submitExpense = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const { category_id, amount, date, description, receipt_url } = req.body

    // Validate category
    const category = await ExpenseCategory.findByPk(category_id)
    if (!category) {
      throw new AppError("Invalid expense category", 400)
    }

    // Check if receipt is required
    if (category.requires_proof && !receipt_url) {
      throw new AppError("Receipt is required for this category", 400)
    }

    // Check max amount limit
    if (category.max_amount && amount > category.max_amount) {
      throw new AppError(`Amount exceeds maximum limit of ${category.max_amount}`, 400)
    }

    // Create expense
    const expense = await Expense.create({
      employee_id: employeeId,
      category_id,
      amount,
      date,
      description,
      receipt_url,
      status: "pending",
    })

    const expenseData = await Expense.findByPk(expense.id, {
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Expense submitted successfully", { expense: expenseData }, 201)
  } catch (error) {
    next(error)
  }
}

// Get all expenses (Admin)
exports.getAllExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, employee_id, category_id, start_date, end_date } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    const whereClause = {}

    if (status) {
      whereClause.status = status
    }

    if (employee_id) {
      whereClause.employee_id = employee_id
    }

    if (category_id) {
      whereClause.category_id = category_id
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

    const { count, rows } = await Expense.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name"],
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

    return paginatedResponse(res, "Expenses retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get my expenses (Employee)
exports.getMyExpenses = async (req, res, next) => {
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

    const { count, rows } = await Expense.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name"],
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

    return paginatedResponse(res, "Your expenses retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get single expense
exports.getExpense = async (req, res, next) => {
  try {
    const { id } = req.params

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: ExpenseCategory,
          as: "category",
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

    if (!expense) {
      throw new AppError("Expense not found", 404)
    }

    // Check access permission (admin or own expense)
    const userRole = req.user.role.name
    const isOwner = expense.employee_id === req.user.employee?.id

    if (!["Super Admin", "Admin", "Manager"].includes(userRole) && !isOwner) {
      throw new AppError("Access denied", 403)
    }

    return successResponse(res, "Expense retrieved successfully", { expense })
  } catch (error) {
    next(error)
  }
}

// Approve expense
exports.approveExpense = async (req, res, next) => {
  try {
    const { id } = req.params

    const expense = await Expense.findByPk(id)

    if (!expense) {
      throw new AppError("Expense not found", 404)
    }

    if (expense.status !== "pending") {
      throw new AppError(`Expense is already ${expense.status}`, 400)
    }

    await expense.update({
      status: "approved",
      approved_by: req.user.id,
      approved_at: new Date(),
    })

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: ExpenseCategory,
          as: "category",
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Expense approved successfully", { expense: updatedExpense })
  } catch (error) {
    next(error)
  }
}

// Reject expense
exports.rejectExpense = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rejection_reason } = req.body

    const expense = await Expense.findByPk(id)

    if (!expense) {
      throw new AppError("Expense not found", 404)
    }

    if (expense.status !== "pending") {
      throw new AppError(`Expense is already ${expense.status}`, 400)
    }

    await expense.update({
      status: "rejected",
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason,
    })

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: ExpenseCategory,
          as: "category",
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Expense rejected successfully", { expense: updatedExpense })
  } catch (error) {
    next(error)
  }
}

// Mark expense as paid
exports.markAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params

    const expense = await Expense.findByPk(id)

    if (!expense) {
      throw new AppError("Expense not found", 404)
    }

    if (expense.status !== "approved") {
      throw new AppError("Only approved expenses can be marked as paid", 400)
    }

    await expense.update({
      status: "paid",
      paid_at: new Date(),
    })

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: ExpenseCategory,
          as: "category",
        },
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "employee_code", "first_name", "last_name"],
        },
      ],
    })

    return successResponse(res, "Expense marked as paid successfully", { expense: updatedExpense })
  } catch (error) {
    next(error)
  }
}

// Upload receipt
exports.uploadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params
    const { receipt_url } = req.body
    const employeeId = req.user.employee?.id

    const expense = await Expense.findByPk(id)

    if (!expense) {
      throw new AppError("Expense not found", 404)
    }

    // Only owner can upload receipt
    if (expense.employee_id !== employeeId) {
      throw new AppError("Access denied", 403)
    }

    if (expense.status !== "pending") {
      throw new AppError("Cannot update receipt for processed expense", 400)
    }

    await expense.update({ receipt_url })

    return successResponse(res, "Receipt uploaded successfully", { expense })
  } catch (error) {
    next(error)
  }
}
