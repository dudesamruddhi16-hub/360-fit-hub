import apiClient from './api'

export const exercisesService = {
  // Get all exercises
  getAll: (params = {}) => apiClient.get('/exercises', params),

  // Get exercise by ID
  getById: (id) => apiClient.get(`/exercises/${id}`),

  // Create new exercise
  create: (exerciseData) => apiClient.post('/exercises', exerciseData),

  // Update exercise
  update: (id, exerciseData) => apiClient.put(`/exercises/${id}`, exerciseData),

  // Delete exercise
  delete: (id) => apiClient.delete(`/exercises/${id}`),
}

