import apiClient from './api'

export const trainerAssignmentsService = {
  // Get all trainer assignments
  getAll: (params = {}) => apiClient.get('/trainerAssignments', params),

  // Get assignment by ID
  getById: (id) => apiClient.get(`/trainerAssignments/${id}`),

  // Create new assignment
  create: (assignmentData) => apiClient.post('/trainerAssignments', assignmentData),

  // Update assignment
  update: (id, assignmentData) => apiClient.put(`/trainerAssignments/${id}`, assignmentData),

  // Delete assignment
  delete: (id) => apiClient.delete(`/trainerAssignments/${id}`),

  // Query assignments by field
  query: (field, value) => apiClient.get('/trainerAssignments/query', { field, value }),
}

