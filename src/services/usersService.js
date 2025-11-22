import apiClient from './api'

export const usersService = {
  // Get all users
  getAll: (params = {}) => apiClient.get('/users', params),

  // Get user by ID
  getById: (id) => apiClient.get(`/users/${id}`),

  // Create new user
  create: (userData) => apiClient.post('/users', userData),

  // Update user
  update: (id, userData) => apiClient.put(`/users/${id}`, userData),

  // Delete user
  delete: (id) => apiClient.delete(`/users/${id}`),

  // Query users by field
  query: (field, value) => apiClient.get('/users/query', { field, value }),
}

