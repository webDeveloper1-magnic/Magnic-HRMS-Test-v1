const { validationResult } = require("express-validator")
const { AppError } = require("./errorHandler")

exports.validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg)
    throw new AppError(errorMessages.join(", "), 400)
  }
  next()
}
