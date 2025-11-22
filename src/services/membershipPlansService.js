import apiClient from './api'

export const membershipPlansService = {
  // Get all membership plans
  getAll: (params = {}) => apiClient.get('/membershipPlans', params),

  // Get plan by ID
  getById: (id) => apiClient.get(`/membershipPlans/${id}`),

  // Create new plan
  create: (planData) => apiClient.post('/membershipPlans', planData),

  // Update plan
  update: (id, planData) => apiClient.put(`/membershipPlans/${id}`, planData),

  // Delete plan
  delete: (id) => apiClient.delete(`/membershipPlans/${id}`),
}

