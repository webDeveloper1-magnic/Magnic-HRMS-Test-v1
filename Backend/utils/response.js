// Success response
exports.successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  }

  if (data !== null) {
    response.data = data
  }

  return res.status(statusCode).json(response)
}

// Paginated response
exports.paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  })
}
