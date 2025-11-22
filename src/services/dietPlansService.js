import apiClient from './api'

export const dietPlansService = {
  // Get all diet plans
  getAll: (params = {}) => apiClient.get('/dietPlans', params),

  // Get diet plan by ID
  getById: (id) => apiClient.get(`/dietPlans/${id}`),

  // Create new diet plan
  create: (dietPlanData) => apiClient.post('/dietPlans', dietPlanData),

  // Update diet plan
  update: (id, dietPlanData) => apiClient.put(`/dietPlans/${id}`, dietPlanData),

  // Delete diet plan
  delete: (id) => apiClient.delete(`/dietPlans/${id}`),

  // Query diet plans by field
  query: (field, value) => apiClient.get('/dietPlans/query', { field, value }),
}

