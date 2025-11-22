import apiClient from './api'

export const workoutPlansService = {
  // Get all workout plans
  getAll: (params = {}) => apiClient.get('/workoutPlans', params),

  // Get workout plan by ID
  getById: (id) => apiClient.get(`/workoutPlans/${id}`),

  // Create new workout plan
  create: (workoutPlanData) => apiClient.post('/workoutPlans', workoutPlanData),

  // Update workout plan
  update: (id, workoutPlanData) => apiClient.put(`/workoutPlans/${id}`, workoutPlanData),

  // Delete workout plan
  delete: (id) => apiClient.delete(`/workoutPlans/${id}`),

  // Query workout plans by field
  query: (field, value) => apiClient.get('/workoutPlans/query', { field, value }),
}

