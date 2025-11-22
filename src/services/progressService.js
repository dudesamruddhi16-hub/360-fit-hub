import apiClient from './api'

export const progressService = {
  // Get all progress records
  getAll: (params = {}) => apiClient.get('/progress', params),

  // Get progress by ID
  getById: (id) => apiClient.get(`/progress/${id}`),

  // Create new progress record
  create: (progressData) => apiClient.post('/progress', progressData),

  // Update progress record
  update: (id, progressData) => apiClient.put(`/progress/${id}`, progressData),

  // Delete progress record
  delete: (id) => apiClient.delete(`/progress/${id}`),

  // Query progress by field
  query: (field, value) => apiClient.get('/progress/query', { field, value }),
}

