const express = require("express")
const { body } = require("express-validator")
const expenseController = require("../controllers/expense.controller")
const { authenticate, authorize } = require("../middleware/auth")
const { validate } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const submitExpenseValidation = [
  body("category_id").isInt().withMessage("Category ID is required"),
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("date").isDate().withMessage("Valid date is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("receipt_url").optional().isURL().withMessage("Valid receipt URL required"),
  validate,
]

const rejectExpenseValidation = [body("rejection_reason").optional().isString(), validate]

const uploadReceiptValidation = [body("receipt_url").isURL().withMessage("Valid receipt URL is required"), validate]

// Employee routes
router.post("/", authenticate, submitExpenseValidation, expenseController.submitExpense)
router.get("/my-expenses", authenticate, expenseController.getMyExpenses)
router.post("/:id/upload", authenticate, uploadReceiptValidation, expenseController.uploadReceipt)

// Admin routes
router.get("/", authenticate, authorize("Admin", "Super Admin", "Manager"), expenseController.getAllExpenses)
router.get("/:id", authenticate, expenseController.getExpense)
router.put("/:id/approve", authenticate, authorize("Admin", "Super Admin", "Manager"), expenseController.approveExpense)
router.put(
  "/:id/reject",
  authenticate,
  authorize("Admin", "Super Admin", "Manager"),
  rejectExpenseValidation,
  expenseController.rejectExpense,
)
router.put("/:id/mark-paid", authenticate, authorize("Admin", "Super Admin"), expenseController.markAsPaid)

module.exports = router
