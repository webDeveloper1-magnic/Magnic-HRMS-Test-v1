// Pagination utility
exports.paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  return {
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  }
}

// Generate pagination metadata
exports.getPaginationMeta = (count, page, limit) => {
  const totalPages = Math.ceil(count / limit)
  return {
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    total: count,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
