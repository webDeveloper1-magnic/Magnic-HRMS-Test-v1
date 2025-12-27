const { Employee, User, Role } = require("../models")
const { AppError } = require("../middleware/errorHandler")
const { successResponse, paginatedResponse } = require("../utils/response")
const { paginate, getPaginationMeta } = require("../utils/pagination")
const { Op } = require("sequelize")

// Create employee
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role_name = "Employee",
      employee_code,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      department,
      designation,
      date_of_joining,
      employment_type,
      salary,
      manager_id,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
    } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new AppError("Email already registered", 400)
    }

    // Check if employee code already exists
    const existingEmployee = await Employee.findOne({ where: { employee_code } })
    if (existingEmployee) {
      throw new AppError("Employee code already exists", 400)
    }

    // Get role
    const role = await Role.findOne({ where: { name: role_name } })
    if (!role) {
      throw new AppError("Invalid role", 400)
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role_id: role.id,
    })

    // Create employee
    const employee = await Employee.create({
      user_id: user.id,
      employee_code,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      department,
      designation,
      date_of_joining,
      employment_type,
      salary,
      manager_id,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
    })

    // Fetch complete employee data
    const employeeData = await Employee.findByPk(employee.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "is_active"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "employee_code"],
        },
      ],
    })

    return successResponse(res, "Employee created successfully", { employee: employeeData }, 201)
  } catch (error) {
    next(error)
  }
}

// Get all employees with pagination, search, and filter
exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, department, status, employment_type } = req.query

    const { limit: queryLimit, offset } = paginate(page, limit)

    // Build where clause
    const whereClause = {}

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { employee_code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    if (department) {
      whereClause.department = department
    }

    if (status) {
      whereClause.status = status
    }

    if (employment_type) {
      whereClause.employment_type = employment_type
    }

    const { count, rows } = await Employee.findAndCountAll({
      where: whereClause,
      limit: queryLimit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "is_active"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "employee_code"],
        },
      ],
      order: [["created_at", "DESC"]],
    })

    const pagination = getPaginationMeta(count, page, limit)

    return paginatedResponse(res, "Employees retrieved successfully", rows, pagination)
  } catch (error) {
    next(error)
  }
}

// Get single employee
exports.getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "is_active", "last_login"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "employee_code", "designation"],
        },
        {
          model: Employee,
          as: "subordinates",
          attributes: ["id", "first_name", "last_name", "employee_code", "designation"],
        },
      ],
    })

    if (!employee) {
      throw new AppError("Employee not found", 404)
    }

    return successResponse(res, "Employee retrieved successfully", { employee })
  } catch (error) {
    next(error)
  }
}

// Update employee
exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const employee = await Employee.findByPk(id)
    if (!employee) {
      throw new AppError("Employee not found", 404)
    }

    // Check if employee code is being changed and if it's unique
    if (updateData.employee_code && updateData.employee_code !== employee.employee_code) {
      const existingEmployee = await Employee.findOne({
        where: { employee_code: updateData.employee_code },
      })
      if (existingEmployee) {
        throw new AppError("Employee code already exists", 400)
      }
    }

    // Update employee
    await employee.update(updateData)

    // Get updated employee data
    const updatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "is_active"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "employee_code"],
        },
      ],
    })

    return successResponse(res, "Employee updated successfully", { employee: updatedEmployee })
  } catch (error) {
    next(error)
  }
}

// Soft delete employee
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params

    const employee = await Employee.findByPk(id)
    if (!employee) {
      throw new AppError("Employee not found", 404)
    }

    // Soft delete employee (paranoid: true handles this)
    await employee.destroy()

    // Also deactivate user
    const user = await User.findByPk(employee.user_id)
    if (user) {
      await user.update({ is_active: false })
    }

    return successResponse(res, "Employee deleted successfully")
  } catch (error) {
    next(error)
  }
}

// Get current employee profile (for employee role)
exports.getMyProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "is_active", "last_login"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Employee,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "employee_code", "designation", "phone"],
        },
      ],
    })

    return successResponse(res, "Profile retrieved successfully", { employee })
  } catch (error) {
    next(error)
  }
}

// Update own profile (limited fields for employees)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id

    if (!employeeId) {
      throw new AppError("Employee profile not found", 404)
    }

    const employee = await Employee.findByPk(employeeId)

    // Allow only specific fields to be updated by employee
    const allowedFields = [
      "phone",
      "address",
      "city",
      "state",
      "country",
      "postal_code",
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relation",
    ]

    const updateData = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    await employee.update(updateData)

    const updatedEmployee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
    })

    return successResponse(res, "Profile updated successfully", { employee: updatedEmployee })
  } catch (error) {
    next(error)
  }
}
