// Helper functions for data normalization

// Convert MongoDB _id to id for frontend compatibility
export const normalizeItem = (item) => {
  if (!item) return null
  if (Array.isArray(item)) {
    return item.map(normalizeItem)
  }
  const { _id, ...rest } = item
  return {
    id: _id || item.id,
    ...rest
  }
}

// Convert id to _id for MongoDB (if needed)
export const denormalizeItem = (item) => {
  if (!item) return null
  if (Array.isArray(item)) {
    return item.map(denormalizeItem)
  }
  const { id, ...rest } = item
  return {
    _id: id,
    ...rest
  }
}

